import {observable, action} from "mobx";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {PaginationState} from "../../utils/types";

const PAGE_SIZE = 10;

const INITIAL_PAGINATION_STATE: PaginationState = {
    initiallyFetched: false,
    noMoreItems: false,
    page: 0,
    pending: false
}

export class PopularChatsStore {
    @observable
    popularChats: string[] = [];

    @observable
    paginationState: PaginationState = {
        initiallyFetched: false,
        noMoreItems: false,
        page: 0,
        pending: false
    };

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
    }

    @action
    fetchPopularChats = (): void => {
        this.paginationState.pending = true;

        ChatApi.getPopularChats({page: this.paginationState.page, pageSize: PAGE_SIZE})
            .then(({data}) => {
                if (data.length !== 0) {
                    if (data.length === PAGE_SIZE) {
                        this.paginationState.page += 1;
                    }

                    this.paginationState.initiallyFetched = true;
                    this.entities.insertChats(data);
                    this.popularChats.push(...data.map(chat => chat.id));
                } else {
                    this.paginationState.noMoreItems = true;
                }
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.paginationState.pending = false);
    };

    @action
    reset = (): void => {
        this.popularChats = [];
        this.paginationState = INITIAL_PAGINATION_STATE;
    };
}
