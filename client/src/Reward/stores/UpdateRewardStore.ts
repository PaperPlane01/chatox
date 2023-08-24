import {action, computed, makeObservable, observable, reaction} from "mobx";
import {AxiosPromise} from "axios";
import {SelectUserForRewardStore} from "./SelectUserForRewardStore";
import {AbstractRewardFormStore} from "./AbstractRewardFormStore";
import {Labels, LocaleStore} from "../../localization";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {isDefined} from "../../utils/object-utils";
import {RewardApi} from "../../api";
import {RewardRequest} from "../../api/types/request";
import {Reward} from "../../api/types/response";

export class UpdateRewardStore extends AbstractRewardFormStore {
    rewardId?: string = undefined;

    get updateRewardDialogOpen(): boolean {
        return isDefined(this.rewardId);
    }

    constructor(entities: EntitiesStore,
                selectedUser: SelectUserForRewardStore,
                localeStore: LocaleStore,
                snackbarService: SnackbarService) {
        super(entities,  selectedUser, localeStore, snackbarService);

        makeObservable<UpdateRewardStore, "populateFromEntity">(this, {
            rewardId: observable,
            updateRewardDialogOpen: computed,
            populateFromEntity: action,
            setRewardId: action
        });

        reaction(
            () => this.rewardId,
            () => this.populateFromEntity()
        );
    }

    setRewardId = (rewardId?: string): void => {
        this.rewardId = rewardId;
    }

    protected validateForm(): boolean {
        if (!Boolean(this.rewardId)) {
            return false;
        }

        return super.validateForm();
    }

    protected getSubmitFunction(): <R extends RewardRequest>(request: R) => AxiosPromise<Reward> {
        return request => RewardApi.updateReward(this.rewardId!, request);
    }

    protected afterSubmit(): void {
        this.setRewardId(undefined);
    }

    protected getSuccessLabel(): keyof Labels {
        return "reward.update.success";
    }

    private populateFromEntity = (): void => {
        if (!this.rewardId) {
            return;
        }

        const reward = this.entities.rewards.findById(this.rewardId);

        this.setForm({
            active: reward.active,
            currency: reward.currency,
            maxRewardValue: reward.maxRewardValue.toString(),
            minRewardValue: reward.minRewardValue.toString(),
            periodEnd: reward.periodEnd,
            periodStart: reward.periodStart,
            recurringPeriodUnit: reward.recurringPeriodUnit,
            recurringPeriodValue: isDefined(reward.recurringPeriodValue)
                ? reward.recurringPeriodValue.toString()
                : "",
            useIntegersOnly: reward.useIntegersOnly,
            userId: reward.rewardedUserId,
            name: reward.name ? reward.name : ""
        });

        if (reward.rewardedUserId) {
            this.selectedUser.setSelectedUser(this.entities.users.findById(reward.rewardedUserId));
        }
    }
}