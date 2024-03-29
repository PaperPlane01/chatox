import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, GlobalBanApi} from "../../api";
import {GlobalBanFilters} from "../../api/types/request";
import {PaginationWithSortingState} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";

const PAGE_SIZE = 30;

const INITIAL_PAGINATION_STATE: PaginationWithSortingState = {
    initiallyFetched: false,
    noMoreItems: false,
    page: 0,
    pending: false,
    sortBy: "expiresAt",
    sortingDirection: "desc"
};

export class GlobalBansListStore {
    globalBanIds: string[] = [];

    error?: ApiError = undefined;

    filters: GlobalBanFilters = {
        excludeExpired: true,
        excludeCanceled: true
    };

    paginationState: PaginationWithSortingState = INITIAL_PAGINATION_STATE;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.filters.excludeCanceled,
            () => this.resetAndFetch()
        );

        reaction(
            () => this.filters.excludeExpired,
            () => this.resetAndFetch()
        );
    }

    fetchGlobalBans = (): void => {
        this.paginationState.pending = true;
        this.error = undefined;

        GlobalBanApi.findBans(this.filters, {
            page: this.paginationState.page,
            pageSize: PAGE_SIZE,
            sortBy: this.paginationState.sortBy,
            sortingDirection: this.paginationState.sortingDirection
        })
            .then(({data}) => runInAction(() => {
                if (data.length !== 0) {
                    this.entities.globalBans.insertAll(data);
                    this.globalBanIds = [
                        ...this.globalBanIds,
                        ...data.map(globalBan => globalBan.id)
                    ];

                    if (!this.paginationState.initiallyFetched) {
                        this.paginationState.initiallyFetched = true;
                    }

                    if (data.length === PAGE_SIZE) {
                        this.paginationState.page = this.paginationState.page + 1;
                    } else {
                        this.paginationState.noMoreItems = true;
                    }
                } else {
                    this.paginationState.noMoreItems = true;
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.paginationState.pending = false));
    };

    setFilterValue = <Key extends keyof GlobalBanFilters>(key: Key, value: GlobalBanFilters[Key]): void => {
        this.filters[key] = value;
    };

    resetAndFetch = (): void => {
        this.reset();
        this.fetchGlobalBans();
    };

    reset = (): void => {
        this.globalBanIds = [];
        this.paginationState = INITIAL_PAGINATION_STATE;
    };
}