import {action, makeObservable, observable} from "mobx";
import {AxiosPromise} from "axios";
import {AbstractRewardFormStore} from "./AbstractRewardFormStore";
import {SelectUserForRewardStore} from "./SelectUserForRewardStore";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {Labels, LocaleStore} from "../../localization";
import {RewardApi} from "../../api";
import {RewardRequest} from "../../api/types/request";
import {Reward} from "../../api/types/response";

export class CreateRewardStore extends AbstractRewardFormStore {
    createRewardDialogOpen = false;

    constructor(entities: EntitiesStore,
                selectedUser: SelectUserForRewardStore,
                localeStore: LocaleStore,
                snackbarService: SnackbarService) {
        super(entities, selectedUser, localeStore, snackbarService);

        makeObservable(this, {
            createRewardDialogOpen: observable,
            setCreateRewardDialogOpen: action
        });
    }

    setCreateRewardDialogOpen = (createRewardDialogOpen: boolean): void => {
        this.createRewardDialogOpen = createRewardDialogOpen;
    }

    protected getSubmitFunction(): <R extends RewardRequest>(request: R) => AxiosPromise<Reward> {
       return RewardApi.createReward;
    }

    protected afterSubmit(): void {
        this.setCreateRewardDialogOpen(false);
    }

    protected getSuccessLabel(): keyof Labels {
        return "reward.create.success";
    }
}