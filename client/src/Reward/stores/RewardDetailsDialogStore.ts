import {makeAutoObservable} from "mobx";
import {isDefined} from "../../utils/object-utils";

export class RewardDetailsDialogStore {
    rewardId: string | undefined = undefined;

    get rewardDetailsDialogOpen(): boolean {
        return isDefined(this.rewardId);
    }

    constructor() {
        makeAutoObservable(this);
    }

    setRewardId = (rewardId: string): void => {
        this.rewardId = rewardId;
    }
}