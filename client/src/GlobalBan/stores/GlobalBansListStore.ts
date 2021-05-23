import {observable, action, reaction} from "mobx";
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
    @observable
    globalBanIds: string[] = [];

    @observable
    error?: ApiError = undefined;

    @observable
    filters: GlobalBanFilters = {
        excludeExpired: true,
        excludeCanceled: true
    };

    @observable
    paginationState: PaginationWithSortingState = INITIAL_PAGINATION_STATE;

    constructor(private readonly entities: EntitiesStore) {
        reaction(
            () => this.filters.excludeCanceled,
            () => this.resetAndFetch()
        );

        reaction(
            () => this.filters.excludeExpired,
            () => this.resetAndFetch()
        );
    }

    @action
    fetchGlobalBans = (): void => {
        this.paginationState.pending = true;
        this.error = undefined;

        GlobalBanApi.findBans(this.filters, {
            page: this.paginationState.page,
            pageSize: PAGE_SIZE,
            sortBy: this.paginationState.sortBy,
            sortingDirection: this.paginationState.sortingDirection
        })
            .then(({data}) => {
                if (data.length !== 0) {
                    this.entities.insertGlobalBans(data);
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
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.paginationState.pending = false);
    }

    @action
    setFilterValue = <Key extends keyof GlobalBanFilters>(key: Key, value: GlobalBanFilters[Key]): void => {
        this.filters[key] = value;
    }

    @action
    resetAndFetch = (): void => {
        this.reset();
        this.fetchGlobalBans();
    }

    @action
    reset = (): void => {
        this.globalBanIds = [];
        this.paginationState = INITIAL_PAGINATION_STATE;
    }
}