import {makeAutoObservable, reaction, runInAction} from "mobx";
import {AxiosPromise} from "axios";
import {PaginationState} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, RewardApi} from "../../api";
import {PaginationRequest} from "../../api/types/request";
import {Reward} from "../../api/types/response";

const INITIAL_FETCHING_STATE: PaginationState = {
    pending: false,
    page: 0,
    initiallyFetched: false,
    noMoreItems: false
};
const PAGE_SIZE = 150;

export class RewardsListStore {
    fetchingState: PaginationState = INITIAL_FETCHING_STATE;

    showActiveOnly = false;

    error?: ApiError = undefined;

    get rewardsIds(): string[] {
        return this.entities.rewards.sortedIds;
    }

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        if (localStorage) {
            this.showActiveOnly = localStorage.getItem("showActiveRewardsOnly") === "true";
        }

        reaction(
            () => this.showActiveOnly,
            () => {
                this.reset();
                this.fetchRewards();
            }
        )
    }

    setShowActiveOnly = (showActiveOnly: boolean): void => {
        this.showActiveOnly = showActiveOnly;
    }

    fetchRewards = (): void => {
        this.fetchingState.pending = true;
        this.error = undefined;

        const paginationRequest: PaginationRequest = {
            page: this.fetchingState.page,
            sortBy: "createdAt",
            direction: "desc",
            pageSize: PAGE_SIZE
        };

        const fetchRewards = this.getRewardsFunction();

        fetchRewards(paginationRequest)
            .then(({data}) => runInAction(() => {
                if (!this.fetchingState.initiallyFetched) {
                    this.fetchingState.initiallyFetched = true;
                }

                this.fetchingState.noMoreItems = data.length === 0 || data.length === PAGE_SIZE;

                if (data.length !== 0) {
                    this.entities.rewards.insertAll(data);
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.fetchingState.pending = false));
    }

    reset = (): void => {
        this.fetchingState = INITIAL_FETCHING_STATE;
        this.entities.rewards.deleteAll();
    };

    private getRewardsFunction = (): (paginationRequest: PaginationRequest) => AxiosPromise<Reward[]> => {
        if (this.showActiveOnly) {
            return RewardApi.getActiveRewards;
        } else  {
            return RewardApi.getAllRewards;
        }
    }
}