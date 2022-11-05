import {mergeWith} from "lodash";
import {ChatBlockingEntity} from "../types";
import {AbstractEntityStoreV2} from "../../entity-store";
import {ChatBlocking, CurrentUser} from "../../api/types/response";
import {EntitiesPatch, EntitiesStoreV2, RawEntitiesStore} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization";
import {computed} from "mobx";

export class ChatBlockingsStoreV2 extends AbstractEntityStoreV2<"chatBlockings", ChatBlockingEntity, ChatBlocking> {
    @computed
    private get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(rawEntities: RawEntitiesStore,
                entities: EntitiesStoreV2,
                private readonly authorization: AuthorizationStore) {
        super(rawEntities, "chatBlockings", entities);
    }

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