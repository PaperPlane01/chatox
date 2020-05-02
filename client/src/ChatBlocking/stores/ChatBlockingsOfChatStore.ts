import {action, computed, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatBlockingEntity, ChatBlockingSortableProperties} from "../types";
import {ChatStore} from "../../Chat";
import {FetchOptions, PaginationWithSortingState} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ChatBlockingApi} from "../../api";
import {ChatBlocking} from "../../api/types/response";
import {isChatBlockingActive} from "../utils";

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

export class ChatBlockingsOfChatStore {
    @observable
    chatBlockingsOfChatStateMap: ChatBlockingsOfChatStateMap = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chat.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore, private readonly chat: ChatStore) {}

    getChatBlockingsOfChatState = createTransformer((chatId: string) => this.chatBlockingsOfChatStateMap[chatId]);

    @action
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

    @action
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
                        sortingDirection,
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
                        sortingDirection,
                        pageSize: PAGE_SIZE
                    }
                )
                    .then(({data}) => this.insertChatBlockings(data, chatId))
                    .finally(() => this.chatBlockingsOfChatStateMap[chatId].pagination.pending = false);
            }
        }
    };

    @action
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

        this.entities.insertChatBlockings(chatBlockings);
    }
}
