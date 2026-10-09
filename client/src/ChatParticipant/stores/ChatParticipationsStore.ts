import {computed, makeObservable} from "mobx";
import {computedFn, createTransformer} from "mobx-utils";
import {mergeWith} from "lodash-es";
import {ChatParticipationEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {ChatParticipation, CurrentUser} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization/stores";

interface InsertChatParticipantOptions {
    increaseChatParticipantsCount?: boolean,
    setCurrentUserChatParticipationId?: boolean
}

type DecreaseChatParticipantsCountCallback = (chatParticipation?: ChatParticipationEntity, currentUser?: CurrentUser) => boolean;

interface DeleteChatParticipantOptions {
    decreaseChatParticipantsCount?: boolean | DecreaseChatParticipantsCountCallback
}

export interface FindChatParticipationByUserAndChatOptions {
    userId: string,
    chatId: string
}

export class ChatParticipationsStore extends AbstractEntityStore<
    "chatParticipations",
    ChatParticipationEntity,
    ChatParticipation,
    InsertChatParticipantOptions,
    DeleteChatParticipantOptions
    > {
    private get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(rawEntities: RawEntitiesStore,
                entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
        super(rawEntities, "chatParticipations", entities);

        makeObservable<ChatParticipationsStore, "currentUser">(this, {
            currentUser: computed
        });
    }

    findByChat = computedFn((chatId: string): string[] => {
        return this.ids.filter(id => this.findById(id).chatId === chatId);
    })

    findByUserAndChat = createTransformer((options: FindChatParticipationByUserAndChatOptions) => {
        return this.ids.map(id => this.findById(id))
            .find(chatParticipation => chatParticipation.chatId === options.chatId
                && chatParticipation.userId === options.userId)
    })

    existsByUserAndChat = createTransformer((options: FindChatParticipationByUserAndChatOptions) => Boolean(
        this.findByUserAndChat(options)
    ))

    deleteById(id: string, options?: DeleteChatParticipantOptions) {
        const chatParticipation = this.findByIdOptional(id);

        if (!chatParticipation) {
            return;
        }

        if (options?.decreaseChatParticipantsCount) {
            const decreaseChatParticipantsCount = typeof options.decreaseChatParticipantsCount === "function"
                ? options.decreaseChatParticipantsCount(chatParticipation, this.currentUser)
                : options.decreaseChatParticipantsCount;
            if (decreaseChatParticipantsCount) {
                this.entities.chats.decreaseChatParticipantsCount(chatParticipation.chatId);
            }
        }

        super.deleteById(id);
    }

    createPatchForArray(denormalizedEntities: ChatParticipation[], options?: InsertChatParticipantOptions): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch(
            "chatParticipations",
            "users",
            "uploads",
            "chatRoles",
            "chats"
        );
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(chatParticipation => {
            const chatParticipationEntity = this.convertToNormalizedForm(chatParticipation);
            patch.entities.chatParticipations.set(chatParticipation.id, chatParticipationEntity);

            patches.push(
                this.entities.users.createPatch(chatParticipation.user),
                this.entities.chatRoles.createPatch(chatParticipation.role)
            );

            if (chatParticipation.activeChatBlocking) {
                patches.push(this.entities.chatBlockings.createPatch(chatParticipation.activeChatBlocking));
            }

            if (options?.increaseChatParticipantsCount || options?.setCurrentUserChatParticipationId) {
                const chat = this.entities.chats.findById(chatParticipation.chatId);

                if (options?.increaseChatParticipantsCount) {
                    chat.participantsCount = chat.participantsCount + 1;
                }

                if (options?.setCurrentUserChatParticipationId && chatParticipation.user.id === this.currentUser?.id) {
                    chat.currentUserParticipationId = chatParticipation.id;
                }

                patch.entities.chats.set(chatParticipation.chatId, chat);
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: ChatParticipation): ChatParticipationEntity {
        return {
            id: denormalizedEntity.id,
            chatId: denormalizedEntity.chatId,
            roleId: denormalizedEntity.role.id,
            userId: denormalizedEntity.user.id,
            activeChatBlockingId: denormalizedEntity.activeChatBlocking
                ? denormalizedEntity.activeChatBlocking.id
                : undefined,
        };
    }
}