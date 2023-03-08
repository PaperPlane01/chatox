import {makeAutoObservable, runInAction} from "mobx";
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
    popularChats: string[] = [];

    paginationState: PaginationState = {
        initiallyFetched: false,
        noMoreItems: false,
        page: 0,
        pending: false
    };

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    fetchPopularChats = (): void => {
        this.paginationState.pending = true;

        ChatApi.getPopularChats({page: this.paginationState.page, pageSize: PAGE_SIZE})
            .then(({data}) => {
                if (data.length !== 0) {
                    if (data.length === PAGE_SIZE) {
                        this.paginationState.page += 1;
                    }

                    this.paginationState.initiallyFetched = true;
                    this.entities.chats.insertAll(data);
                    this.popularChats.push(...data.map(chat => chat.id));
                } else {
                    this.paginationState.noMoreItems = true;
                }
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.paginationState.pending = false));
    };

    reset = (): void => {
        this.popularChats = [];
        this.paginationState = INITIAL_PAGINATION_STATE;
    };
}
