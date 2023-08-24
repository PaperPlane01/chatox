import {UserRewardEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {UserReward} from "../../api/types/response";

export class UserRewardsStore extends AbstractEntityStore<"userRewards", UserRewardEntity, UserReward> {
    createPatchForArray(denormalizedEntities: UserReward[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("userRewards");

        denormalizedEntities.forEach(reward => {
            patch.ids.userRewards.push(reward.id);
            patch.entities.userRewards[reward.id] = this.convertToNormalizedForm(reward);
        });

        return patch;
    }

    protected convertToNormalizedForm(denormalizedEntity: UserReward): UserRewardEntity {
        return {
            id: denormalizedEntity.id,
            currency: denormalizedEntity.currency,
            periodStart: denormalizedEntity.periodStart ? new Date(denormalizedEntity.periodStart) : undefined,
            periodEnd: denormalizedEntity.periodEnd ? new Date(denormalizedEntity.periodEnd) : undefined,
            lastClaim: denormalizedEntity.lastClaim ? new Date(denormalizedEntity.lastClaim) : undefined,
            recurringPeriodUnit: denormalizedEntity.recurringPeriodUnit,
            recurringPeriodValue: denormalizedEntity.recurringPeriodValue
        };
    }
}