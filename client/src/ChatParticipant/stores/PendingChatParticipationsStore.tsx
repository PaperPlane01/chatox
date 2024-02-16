import {mergeWith} from "lodash";
import {PendingChatParticipationEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {PendingChatParticipant} from "../../api/types/response";
import {EntitiesPatch} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";

export class PendingChatParticipationsStore extends AbstractEntityStore<"pendingChatParticipations", PendingChatParticipationEntity, PendingChatParticipant> {
    createPatchForArray(denormalizedEntities: PendingChatParticipant[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("pendingChatParticipations");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(pendingChatParticipant => {
            const entity = this.convertToNormalizedForm(pendingChatParticipant);
            patch.ids.pendingChatParticipations.push(entity.id);
            patch.entities.pendingChatParticipations[entity.id] = entity;
            patches.push(this.entities.users.createPatch(pendingChatParticipant.user));
        });

        return mergeWith(patch, patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: PendingChatParticipant): PendingChatParticipationEntity {
        return {
            id: denormalizedEntity.id,
            chatId: denormalizedEntity.chatId,
            userId: denormalizedEntity.user.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            restoredChatParticipationId: denormalizedEntity.restoredChatParticipationId
        };
    }
}