import {mergeWith} from "lodash";
import {ChatBlockingEntity, ChatBlockingSortableProperties} from "../types";
import {AbstractEntityStoreV2} from "../../entity-store";
import {ChatBlocking, CurrentUser} from "../../api/types/response";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization";
import {action, computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {SortingDirection} from "../../utils/types";

export interface FindChatBlockingsByChatOptions {
    chatId: string,
    sortingProperty?: ChatBlockingSortableProperties,
    sortingDirection?: SortingDirection,
    filter?: (chatBlocking: ChatBlockingEntity) => boolean
}

export class ChatBlockingsStore extends AbstractEntityStoreV2<"chatBlockings", ChatBlockingEntity, ChatBlocking> {
    @computed
    private get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(rawEntities: RawEntitiesStore,
                entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
        super(rawEntities, "chatBlockings", entities);
    }

    findByChat = createTransformer((options: FindChatBlockingsByChatOptions) => {
        const {
            chatId,
            sortingProperty = "blockedUntil",
            sortingDirection = "desc",
            filter = (chatBlocking: ChatBlockingEntity) => !chatBlocking.hidden
        } = options;

        switch (sortingProperty) {
            case "blockedUntil":
                return this.ids.map(id => this.findById(id))
                    .filter(blocking => blocking.chatId === chatId && filter(blocking))
                    .slice()
                    .sort((left, right) => {
                        if (sortingDirection === "desc") {
                            return right.blockedUntil.getTime() - left.blockedUntil.getTime();
                        } else {
                            return left.blockedUntil.getTime() - right.blockedUntil.getTime();
                        }
                    })
                    .map(blocking => blocking.id);
            case "createdAt":
            default:
                return this.ids.map(id => this.findById(id))
                    .filter(blocking => blocking.chatId === chatId && filter(blocking))
                    .slice()
                    .sort((left, right) => {
                        if (sortingDirection === "desc") {
                            return left.createdAt.getTime() - right.createdAt.getTime();
                        } else {
                            return right.createdAt.getTime() - left.createdAt.getTime();
                        }
                    })
                    .map(blocking => blocking.id);

        }
    });

    @action
    hideByChat = (chatId: string): void => {
        const chatBlockingsIds = this.findByChat({chatId});
        const chatBlockings = chatBlockingsIds.map(id => this.findById(id));
        chatBlockings.forEach(blocking => blocking.hidden = true);
        this.insertAllEntities(chatBlockings);
    };

    createPatchForArray(denormalizedEntities: ChatBlocking[], options: {} = {}): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("chatBlockings", "chatParticipations");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(chatBlocking => {
            const chatBlockingEntity = this.convertToNormalizedForm(chatBlocking);
            patch.entities.chatBlockings[chatBlocking.id] = chatBlockingEntity;
            patch.ids.chatBlockings.push(chatBlocking.id);

            patches.push(this.entities.users.createPatch(chatBlocking.blockedUser));
            patches.push(this.entities.users.createPatch(chatBlocking.blockedBy));

            if (chatBlocking.canceledBy) {
                patches.push(this.entities.users.createPatch(chatBlocking.canceledBy));
            }

            if (chatBlocking.lastModifiedBy) {
                patches.push(this.entities.users.createPatch(chatBlocking.lastModifiedBy));
            }

            if (this.currentUser && chatBlocking.blockedUser.id === this.currentUser.id) {
                const chatParticipation = this.entities.chatParticipations.findByUserAndChat({
                    userId: this.currentUser.id,
                    chatId: chatBlocking.chatId
                });

                if (chatParticipation) {
                    chatParticipation.activeChatBlockingId = chatBlocking.id;
                    patch.entities.chatParticipations[chatParticipation.id] = chatParticipation;
                }
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }


    protected convertToNormalizedForm(denormalizedEntity: ChatBlocking): ChatBlockingEntity {
        return {
            id: denormalizedEntity.id,
            blockedById: denormalizedEntity.blockedBy.id,
            blockedUntil: new Date(denormalizedEntity.blockedUntil),
            blockedUserId: denormalizedEntity.blockedUser.id,
            canceled: denormalizedEntity.canceled,
            canceledAt: denormalizedEntity.canceledAt ? new Date(denormalizedEntity.canceledAt) : undefined,
            canceledByUserId: denormalizedEntity.canceledBy && denormalizedEntity.canceledBy.id,
            chatId: denormalizedEntity.chatId,
            description: denormalizedEntity.description,
            lastModifiedAt: denormalizedEntity.lastModifiedAt ? new Date(denormalizedEntity.lastModifiedAt) : undefined,
            lastModifiedByUserId: denormalizedEntity.lastModifiedBy && denormalizedEntity.lastModifiedBy.id,
            hidden: false,
            createdAt: new Date(denormalizedEntity.createdAt)
        }
    }
}