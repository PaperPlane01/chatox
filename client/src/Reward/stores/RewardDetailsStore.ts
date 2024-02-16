import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";

interface RewardDetailsMap {
    [rewardId: string]: boolean
}

export class RewardDetailsStore {
    rewardDetailsMap: RewardDetailsMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    expandRewardDetails = (rewardId: string): void => {
        this.rewardDetailsMap[rewardId] = true;
    }

    collapseRewardDetails = (rewardId: string): void => {
        this.rewardDetailsMap[rewardId] = false;
    }

    isRewardDetailsExpanded = computedFn((rewardId: string): boolean => {
        return Boolean(this.rewardDetailsMap[rewardId]);
    })
}