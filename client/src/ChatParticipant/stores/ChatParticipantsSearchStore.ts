import {makeAutoObservable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {PaginationState} from "../../utils/types";
import {ApiError, ChatParticipantApi, getInitialApiErrorFromResponse} from "../../api";
import {PaginationRequest} from "../../api/types/request";
import {isStringEmpty} from "../../utils/string-utils";

interface ResetOptions {
    keepSearchMode: boolean
}

const INITIAL_PAGINATION_STATE: PaginationState = {
    initiallyFetched: false,
    noMoreItems: false,
    pending: false,
    page: 0
};
const PAGE_SIZE = 100;
const DEFAULT_RESET_OPTIONS: ResetOptions = {
    keepSearchMode: false
};

export class ChatParticipantsSearchStore {
    query: string = "";

    foundChatParticipantsIds: string[] = [];

    paginationState: PaginationState = INITIAL_PAGINATION_STATE;

    error?: ApiError = undefined;

    isInSearchMode: boolean = false;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);

        this.searchChatParticipants = debounce(this.searchChatParticipants, 300);

        reaction(
            () => this.query,
            query => {
                if (isStringEmpty(query)) {
                    this.reset({keepSearchMode: true});
                } else {
                    this.resetSearchResults();
                    this.searchChatParticipants();
                }
            }
        );
        reaction(
            () => this.selectedChatId,
            () => this.reset()
        );
    }

    setQuery = (query: string): void => {
        this.query = query;
    };

    clearQuery = (): void => this.setQuery("");

    setInSearchMode = (isInSearchMode: boolean): void => {
        this.isInSearchMode = isInSearchMode;
    };

    searchChatParticipants = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        if (isStringEmpty(this.query, true)) {
            return;
        }

        if (this.paginationState.noMoreItems) {
            return;
        }

        this.paginationState.pending = true;
        this.error = undefined;

        const paginationRequest: PaginationRequest = {
            page: this.paginationState.page,
            pageSize: PAGE_SIZE
        };

        ChatParticipantApi.searchChatParticipants(this.selectedChatId, this.query, paginationRequest)
            .then(({data}) => runInAction(() => {
                if (data.length === 0) {
                    this.paginationState.noMoreItems = true;
                } else {
                    this.entities.chatParticipations.insertAll(data);
                    this.foundChatParticipantsIds = [
                        ...this.foundChatParticipantsIds,
                        ...data.map(chatParticipant => chatParticipant.id)
                    ];

                    if (data.length === PAGE_SIZE) {
                        this.paginationState.page = this.paginationState.page + 1;
                    } else {
                        this.paginationState.noMoreItems = true;
                    }
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.paginationState.pending = false));
    };

    resetSearchResults = (): void => {
        this.paginationState = INITIAL_PAGINATION_STATE;
        this.foundChatParticipantsIds = [];
    };

    reset = (resetOptions: ResetOptions = DEFAULT_RESET_OPTIONS): void => {
        const {keepSearchMode} = resetOptions;
        this.isInSearchMode = keepSearchMode;
        this.resetSearchResults();
        this.query = "";
        this.error = undefined;
    };
}