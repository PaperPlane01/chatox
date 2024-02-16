import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ClaimableRewardsStore} from "./ClaimableRewardsStore";
import {ApiError, getInitialApiErrorFromResponse, RewardApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class RewardClaimStore {
    claimedAmount?: number = undefined;

    showClaimedAmount = false;

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly claimableRewards: ClaimableRewardsStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.showClaimedAmount,
            showClaimedAmount => {
                if (showClaimedAmount) {
                    setTimeout(() => this.setShowClaimedAmount(false), 2000);
                }
            }
        );
    }

    claimNextReward = (): void => {
        if (this.claimableRewards.claimableRewardsIds.length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const nextRewardId = this.claimableRewards.getNextRewardId();

        if (!nextRewardId) {
            this.pending = false;
            return;
        }

        const reward = this.entities.userRewards.findById(nextRewardId);

        RewardApi.claimReward(nextRewardId)
            .then(({data}) => runInAction(() => {
                this.claimedAmount = data.claimedAmount;
                this.setShowClaimedAmount(true);
                reward.lastClaim = new Date(data.createdAt);
                this.entities.userRewards.insertEntity(reward);
                this.claimableRewards.setTimeoutToNextClaimDate(reward, true);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    setShowClaimedAmount = (showClaimedAmount: boolean): void => {
        this.showClaimedAmount = showClaimedAmount;
    }
}