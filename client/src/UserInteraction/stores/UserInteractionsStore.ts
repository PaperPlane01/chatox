import {mergeWith} from "lodash";
import {UserInteractionEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {UserInteraction} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class UserInteractionsStore extends AbstractEntityStore<"userInteractions", UserInteractionEntity, UserInteraction> {
    createPatchForArray(denormalizedEntities: UserInteraction[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyPatch();
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(userInteraction => {
            patch.ids.userInteractions.push(userInteraction.id);
            patch.entities.userInteractions[userInteraction.id] = this.convertToNormalizedForm(userInteraction);

            patches.push(this.entities.users.createPatch(userInteraction.user));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: UserInteraction): UserInteractionEntity {
        return {
            id: denormalizedEntity.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            type: denormalizedEntity.type,
            userId: denormalizedEntity.user.id
        };
    }
}