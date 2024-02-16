import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {differenceInMilliseconds, isAfter, isBefore} from "date-fns";
import {UserRewardEntity} from "../types";
import {ApiError, RewardApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {Duration} from "../../utils/date-utils";
import {AuthorizationStore} from "../../Authorization";

export class ClaimableRewardsStore {
    pending = false;

    error?: ApiError = undefined;

    claimableRewardsIds: string[] = [];

    claimableRewardsTimeouts = observable.map<string, ReturnType<typeof setTimeout>>();

    get claimableRewardsAvailable(): boolean {
        return this.claimableRewardsIds.length !== 0;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => this.authorization.currentUser,
            user => {
                this.reset();

                if (user) {
                    this.fetchRewards();
                }
            }
        )
    }

    fetchRewards = (): void => {
        this.pending = true;
        this.error = undefined;

        RewardApi.getAvailableRewards()
            .then(({data}) => {
                this.entities.userRewards.insertAll(data);
                this.calculateClaimableRewards();
            });
    }

    calculateClaimableRewards = (): void => {
        const rewards = this.entities.userRewards.findAll();

        for (const reward of rewards) {
            this.setTimeoutToNextClaimDate(reward);
        }
    }

    getNextRewardId = (): string | undefined => {
        return this.claimableRewardsIds.pop();
    }

    setTimeoutToNextClaimDate = (reward: UserRewardEntity, skipClaimableRewardsFiltering: boolean = false): void => {
        this.claimableRewardsTimeouts.delete(reward.id);

        if (!skipClaimableRewardsFiltering) {
            this.claimableRewardsIds = this.claimableRewardsIds.filter(rewardId => rewardId !== reward.id);
        }

        if (reward.periodEnd && isBefore(reward.periodEnd, new Date())) {
            return;
        }

        const rewardStarted = reward.periodStart
            ? isAfter(reward.periodStart, new Date())
            : true;

        if (!rewardStarted) {
            const timeoutValue = differenceInMilliseconds(new Date(), reward.periodStart!);
            const timeout = setTimeout(
                () => runInAction(() => this.claimableRewardsIds.push(reward.id)),
                timeoutValue
            );
            this.claimableRewardsTimeouts.set(reward.id, timeout);
        } else if (!reward.lastClaim) {
            this.claimableRewardsIds.push(reward.id);
        } else if (reward.recurringPeriodUnit && reward.recurringPeriodValue) {
            const nextDate = Duration
                .of(reward.recurringPeriodValue, reward.recurringPeriodUnit)
                .addToDate(reward.lastClaim);

            if (isBefore(nextDate, new Date())) {
                this.claimableRewardsIds.push(reward.id);
            } else {
                const timeoutValue = differenceInMilliseconds(nextDate, new Date());
                const timeout = setTimeout(
                    () => runInAction(() => this.claimableRewardsIds.push(reward.id)),
                    timeoutValue
                );
                this.claimableRewardsTimeouts.set(reward.id, timeout);
            }
        }
    }

    reset = (): void => {
        this.pending = false;
        this.error = undefined;

        this.claimableRewardsTimeouts.forEach(timeout => clearTimeout(timeout))
        this.claimableRewardsIds = [];
    }
}