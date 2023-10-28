import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatBlockingEntity, ChatBlockingSortableProperties} from "../types";
import {isChatBlockingActive} from "../utils";
import {ChatStore} from "../../Chat";
import {FetchOptions, PaginationWithSortingState, SortingDirection} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ChatBlockingApi} from "../../api";
import {ChatBlocking} from "../../api/types/response";

const PAGE_SIZE = 100;

export interface ChatBlockingsOfChatState {
    pagination: PaginationWithSortingState<ChatBlockingSortableProperties>,
    showActiveOnly: boolean,
    filter?: (chatBlocking: ChatBlockingEntity) => boolean
}

export interface ChatBlockingsOfChatStateMap {
    [chatId: string]: ChatBlockingsOfChatState
}

const activeOnlyFilter = (chatBlocking: ChatBlockingEntity) => isChatBlockingActive(chatBlocking);

const INITIAL_PAGINATION_STATE: ChatBlockingsOfChatState  = {
   pagination: {
       page: 0,
       pending: false,
       initiallyFetched: false,
       noMoreItems: false,
       sortBy: "createdAt",
       sortingDirection: "desc"
   },
    showActiveOnly: true
};

export class ChatBlockingsOfChatStore {
    chatBlockingsOfChatStateMap: ChatBlockingsOfChatStateMap = {};

    get selectedChatId(): string | undefined {
        return this.chat.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore, private readonly chat: ChatStore) {
        makeAutoObservable(this);
    }

    getChatBlockingsOfChatState = computedFn((chatId: string) => {
        if (this.chatBlockingsOfChatStateMap[chatId]) {
            return this.chatBlockingsOfChatStateMap[chatId];
        } else {
            return INITIAL_PAGINATION_STATE;
        }
    });

    setShowActiveOnly = (showActiveOnly: boolean, chatId: string | undefined = this.selectedChatId): void => {
        if (chatId) {
            const chatBlockingsOfChatState = this.getChatBlockingsOfChatState(chatId);

            let filter: ((chatBlocking: ChatBlockingEntity) => boolean) | undefined;

            if (showActiveOnly) {
                filter = activeOnlyFilter;
            } else {
                filter = undefined;
            }

            chatBlockingsOfChatState.filter = filter;
            chatBlockingsOfChatState.showActiveOnly = showActiveOnly;
            chatBlockingsOfChatState.pagination = {
                page: 0,
                pending: false,
                initiallyFetched: false,
                noMoreItems: false,
                sortBy: chatBlockingsOfChatState.pagination.sortBy,
                sortingDirection: chatBlockingsOfChatState.pagination.sortingDirection
            };
            this.fetchChatBlockings(
                {abortIfInitiallyFetched: false},
                chatId,
                showActiveOnly
            )
        }
    };

    setSortingDirectionAndProperty = (sortingDirection: SortingDirection,
                                      sortBy: ChatBlockingSortableProperties,
                                      chatId: string | undefined = this.selectedChatId
    ): void  => {
        if (chatId) {
            const chatBlockingsState = this.getChatBlockingsOfChatState(chatId);
            chatBlockingsState.pagination = {
                page: 0,
                pending: false,
                initiallyFetched: false,
                noMoreItems: false,
                sortBy: sortBy,
                sortingDirection: sortingDirection
            };
            this.entities.chatBlockings.hideByChat(chatId);
            this.fetchChatBlockings(
                {abortIfInitiallyFetched: false},
                chatId,
                chatBlockingsState.showActiveOnly
            )
        }
    };

    fetchChatBlockings = (fetchOptions: FetchOptions | undefined = {abortIfInitiallyFetched: true},
                          chatId: string | undefined = this.selectedChatId,
                          activeOnly: boolean | undefined = true): void => {
        if (chatId) {
            if (!this.chatBlockingsOfChatStateMap[chatId]) {
                this.chatBlockingsOfChatStateMap[chatId] = {
                    pagination: {
                        page: 0,
                        pending: false,
                        initiallyFetched: false,
                        noMoreItems: false,
                        sortBy: "createdAt",
                        sortingDirection: "desc"
                    },
                    showActiveOnly: activeOnly,
                    filter: activeOnly ? activeOnlyFilter : undefined
                }
            }

            const showActiveOnly = this.chatBlockingsOfChatStateMap[chatId].showActiveOnly;
            const {page, sortBy, sortingDirection, initiallyFetched} = this.chatBlockingsOfChatStateMap[chatId].pagination;

            if (initiallyFetched && fetchOptions.abortIfInitiallyFetched) {
                return;
            }

            this.chatBlockingsOfChatStateMap[chatId].pagination.pending = true;

            if (showActiveOnly) {
                ChatBlockingApi.findActiveBlockingsByChat(
                    chatId,
                    {
                        page,
                        sortBy,
                        direction: sortingDirection,
                        pageSize: PAGE_SIZE
                    }
                )
                    .then(({data}) => this.insertChatBlockings(data, chatId))
                    .finally(() => this.chatBlockingsOfChatStateMap[chatId].pagination.pending = false);
            } else {
                ChatBlockingApi.findAllChatBlockingsByChat(
                    chatId,
                    {
                        page,
                        sortBy,
                        direction: sortingDirection,
                        pageSize: PAGE_SIZE
                    }
                )
                    .then(({data}) => this.insertChatBlockings(data, chatId))
                    .finally(() => this.chatBlockingsOfChatStateMap[chatId].pagination.pending = false);
            }
        }
    };

    insertChatBlockings = (chatBlockings: ChatBlocking[], chatId: string): void => {
        if (chatBlockings.length === PAGE_SIZE) {
            this.chatBlockingsOfChatStateMap[chatId].pagination = {
                ...this.chatBlockingsOfChatStateMap[chatId].pagination,
                initiallyFetched: true,
                page: this.chatBlockingsOfChatStateMap[chatId].pagination.page + 1
            }
        } else {
            this.chatBlockingsOfChatStateMap[chatId].pagination = {
                ...this.chatBlockingsOfChatStateMap[chatId].pagination,
                initiallyFetched: true,
                noMoreItems: true
            }
        }

        this.entities.chatBlockings.insertAll(chatBlockings);
    };
}
