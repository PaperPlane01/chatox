import {action, computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {mergeWith} from "lodash";
import {ChatParticipationEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {ChatParticipation, CurrentUser} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization";

interface InsertChatParticipantOptions {
    increaseChatParticipantsCount: boolean
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
    @computed
    private get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(rawEntities: RawEntitiesStore,
                entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
        super(rawEntities, "chatParticipations", entities);
    }

    findByChat = createTransformer((chatId: string) => {
        return this.ids
            .filter(id => this.findById(id).chatId === chatId);
    });

    findByUserAndChat = createTransformer((options: FindChatParticipationByUserAndChatOptions) => {
        return this.ids.map(id => this.findById(id))
            .find(chatParticipation => chatParticipation.chatId === options.chatId
                && chatParticipation.userId === options.userId)
    });

    existsByUserAndChat = createTransformer((options: FindChatParticipationByUserAndChatOptions) => Boolean(
        this.findByUserAndChat(options)
    ));

    @action.bound
    deleteById(id: string, options?: DeleteChatParticipantOptions) {
        const chatParticipation = this.findByIdOptional(id);

        if (!chatParticipation) {
            return;
        }

        if (options && options.decreaseChatParticipantsCount) {
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
            patch.entities.chatParticipations[chatParticipation.id] = chatParticipationEntity;
            patch.ids.chatParticipations.push(chatParticipationEntity.id);

            patches.push(this.entities.users.createPatch(chatParticipation.user));
            patches.push(this.entities.chatRoles.createPatch(chatParticipation.role));

            if (chatParticipation.activeChatBlocking) {
                patches.push(this.entities.chatBlockings.createPatch(chatParticipation.activeChatBlocking));
            }

            if (options && options.increaseChatParticipantsCount) {
                const chat = this.entities.chats.findById(chatParticipation.chatId);
                chat.participantsCount = chat.participantsCount + 1;

                patch.entities.chats[chat.id] = chat;
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