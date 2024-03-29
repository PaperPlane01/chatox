import {makeAutoObservable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatStore} from "../../Chat";
import {PaginationState} from "../../utils/types";
import {ChatApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

interface ChatParticipantsPaginationStateMap {
    [chatId: string]: PaginationState
}

interface FetchChatParticipantsOptions {
    abortIfInitiallyFetched: boolean
}

export class ChatParticipantsStore {
    paginationStateMap: ChatParticipantsPaginationStateMap = {};

    get selectedChat(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get chatParticipants(): string[] {
        if (this.selectedChat) {
            return this.entities.chatParticipations.findByChat(this.selectedChat);
        } else {
            return [];
        }
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChat,
            () => this.fetchChatParticipants({abortIfInitiallyFetched: true})
        )
    }

    getPaginationState = computedFn((chatId: string) => {
        if (this.paginationStateMap[chatId]) {
            return this.paginationStateMap[chatId];
        } else {
            return {
                initiallyFetched: false,
                noMoreItems: false,
                page: 0,
                pending: false
            }
        }
    });

    fetchChatParticipants = (options: FetchChatParticipantsOptions = {abortIfInitiallyFetched: false}): void => {
        if (this.selectedChat) {
            const chatId = this.selectedChat;
            if (!this.paginationStateMap[chatId]) {
                this.paginationStateMap[chatId] = {
                    page: 0,
                    noMoreItems: false,
                    pending: false,
                    initiallyFetched: false
                }
            }

            if (this.getPaginationState(chatId).initiallyFetched && options.abortIfInitiallyFetched) {
                return;
            }

            if (!this.getPaginationState(chatId).noMoreItems) {
                this.paginationStateMap[chatId].pending = true;

                ChatApi.getChatParticipants(chatId, this.paginationStateMap[chatId].page)
                    .then(({data}) => runInAction(() => {
                        if (data.length !== 0) {
                            this.entities.chatParticipations.insertAll(data);
                            this.paginationStateMap[chatId].initiallyFetched = true;
                            this.paginationStateMap[chatId].page = this.paginationStateMap[chatId].page + 1;
                        } else {
                            this.paginationStateMap[chatId].noMoreItems = true;
                        }
                    }))
                    .finally(() => runInAction(() => this.paginationStateMap[chatId].pending = false));
            }
        }
    };
}
