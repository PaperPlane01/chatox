import {action, makeObservable, observable} from "mobx";
import {AxiosPromise} from "axios";
import {AbstractRewardFormStore} from "./AbstractRewardFormStore";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {Labels, LocaleStore} from "../../localization";
import {RewardApi} from "../../api";
import {RewardRequest} from "../../api/types/request";
import {Reward} from "../../api/types/response";
import {SelectUserStore} from "../../UserSelect";

export class CreateRewardStore extends AbstractRewardFormStore {
    createRewardDialogOpen = false;

    constructor(entities: EntitiesStore,
                selectedUser: SelectUserStore,
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