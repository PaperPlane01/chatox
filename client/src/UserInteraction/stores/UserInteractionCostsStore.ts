import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, UserInteractionsApi} from "../../api";
import {UserInteractionType} from "../../api/types/response";
import {UserProfileStore} from "../../User";

export class UserInteractionCostsStore {
    costs = observable.map<UserInteractionType, number>();

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly userProfile: UserProfileStore) {
        makeAutoObservable(this);

        reaction(
            () => this.userProfile.selectedUserId,
            userId => {
                if (userId) {
                    this.fetchUserInteractionCosts();
                }
            }
        );
    }

    fetchUserInteractionCosts = (): void => {
        this.pending = false;
        this.error = undefined;

        UserInteractionsApi.getUserInteractionCosts()
            .then(({data}) => runInAction(() => {
                data.forEach(cost => this.costs.set(cost.type, cost.cost));
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    getUserInteractionCost = computedFn((type: UserInteractionType) => this.costs.get(type))
}