import {makeAutoObservable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {PaginationState} from "../../utils/types";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatInviteApi, getInitialApiErrorFromResponse} from "../../api";

const INITIAL_PAGINATION_STATE: PaginationState = {
    page: 0,
    initiallyFetched: false,
    pending: false,
    noMoreItems: false
};
const PAGE_SIZE = 100;

export class ChatInviteListStore {
    paginationStateMap: {[chatId: string]: PaginationState} = {};

    chatInvitesMap: {[chatId: string]: string[]} = {};

    error?: ApiError = undefined;

    get selectedChatId(): string | undefined {
        return this.chat.selectedChatId;
    }

    get selectedChatPaginationState(): PaginationState {
        if (!this.selectedChatId) {
            return INITIAL_PAGINATION_STATE;
        }

        return this.getPaginationState(this.selectedChatId);
    }

    get selectedChatInvitesIds(): string[] {
        if (!this.selectedChatId) {
            return [];
        }

        return this.getChatInvitesIds(this.selectedChatId);
    }

    constructor(private readonly chat: ChatStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    getPaginationState = computedFn((chatId: string): PaginationState => {
        if (!this.chatInvitesMap[chatId]) {
            this.initPaginationState(chatId);
        }

        return this.paginationStateMap[chatId];
    })

    getChatInvitesIds = computedFn((chatId: string): string[] => {
        if (!this.chatInvitesMap[chatId]) {
            this.initInviteList(chatId);
        }

        return this.chatInvitesMap[chatId];
    })

    setPending = (chatId: string, pending: boolean): void => {
        this.paginationStateMap[chatId].pending = pending;
    }

    setInitiallyFetched = (chatId: string, initiallyFetched: boolean): void => {
        this.paginationStateMap[chatId].initiallyFetched = initiallyFetched;
    }

    setNoMoreItems = (chatId: string, noMoreItems: boolean): void => {
        this.paginationStateMap[chatId].noMoreItems = noMoreItems;
    }

    setPage = (chatId: string, page: number): void => {
        this.paginationStateMap[chatId].page = page;
    }

    initPaginationState = (chatId: string): void => {
        this.paginationStateMap[chatId] = INITIAL_PAGINATION_STATE;
        this.chatInvitesMap[chatId] = [];
    }

    initInviteList = (chatId: string): void => {
        this.chatInvitesMap[chatId] = [];
    }

    fetchChatInvites = (): void => {
        if (!this.selectedChatId) {
            return;
        }

        const chatId = this.selectedChatId;
        const paginationState = this.getPaginationState(chatId);

        if (paginationState.noMoreItems) {
            return;
        }

        this.setPending(chatId, true);
        this.error = undefined;

        ChatInviteApi.getChatInvites(
            this.selectedChatId,
            {
                page: paginationState.page,
                pageSize: PAGE_SIZE
            }
        )
            .then(({data}) => runInAction(() => {
                this.setInitiallyFetched(chatId, true);
                this.entities.chatInvites.insertAll(data);
                this.chatInvitesMap[chatId].push(...data.map(invite => invite.id));

                if (data.length < PAGE_SIZE) {
                    this.setNoMoreItems(chatId, true);
                } else {
                    this.setPage(chatId, paginationState.page + 1);
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(chatId, false));
    }
}