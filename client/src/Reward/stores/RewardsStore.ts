import {mergeWith} from "lodash";
import {RewardEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {Reward} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";

export class RewardsStore extends AbstractEntityStore<"rewards", RewardEntity, Reward> {
    constructor(rawEntities: RawEntitiesStore, entities: EntitiesStore) {
        super(rawEntities, "rewards", entities);

        this.setSortBy(["createdAt"]);
        this.setSortingDirection("desc");
    }

    createPatchForArray(denormalizedEntities: Reward[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("rewards", "users");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(reward => {
            patch.entities.rewards[reward.id] = this.convertToNormalizedForm(reward);
            patch.ids.rewards.push(reward.id);

            const users = [
                reward.createdBy,
                reward.updatedBy,
                reward.rewardedUser
            ]
                .filter(isDefined);
            patches.push(this.entities.users.createPatchForArray(
                users,
                {retrieveOnlineStatusFromExistingUser: true}
            ));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: Reward): RewardEntity {
        return {
            id: denormalizedEntity.id,
            currency: denormalizedEntity.currency,
            createdAt: new Date(denormalizedEntity.createdAt),
            createdById: denormalizedEntity.createdBy.id,
            maxRewardValue: denormalizedEntity.maxRewardValue,
            minRewardValue: denormalizedEntity.minRewardValue,
            periodEnd: denormalizedEntity.periodEnd ? new Date(denormalizedEntity.periodEnd) : undefined,
            periodStart: denormalizedEntity.periodStart ? new Date(denormalizedEntity.periodStart) : undefined,
            recurringPeriodUnit: denormalizedEntity.recurringPeriodUnit,
            recurringPeriodValue: denormalizedEntity.recurringPeriodValue,
            rewardedUserId: denormalizedEntity.rewardedUser?.id,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            updatedById: denormalizedEntity.updatedBy?.id,
            useIntegersOnly: denormalizedEntity.useIntegersOnly,
            name: denormalizedEntity.name,
            active: denormalizedEntity.active
        }
    }
}