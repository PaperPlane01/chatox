import {observable, action, computed, reaction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatStore} from "./ChatStore";
import {PaginationState} from "../../utils/types";
import {ChatApi} from "../../api/clients";
import {EntitiesStore} from "../../entities-store";

interface ChatParticipantsPaginationStateMap {
    [chatId: string]: PaginationState
}

interface FetchChatParticipantsOptions {
    abortIfInitiallyFetched: boolean
}

export class ChatParticipantsStore {
    @observable
    paginationStateMap: ChatParticipantsPaginationStateMap = {};

    @computed
    get selectedChat(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get chatParticipants(): string[] {
        if (this.selectedChat) {
            return this.entities.chats.findById(this.selectedChat).participants;
        } else {
            return [];
        }
    }

    constructor(
        private readonly entities: EntitiesStore,
        private readonly chatStore: ChatStore
    ) {
        reaction(
            () => this.selectedChat,
            () => this.fetchChatParticipants({abortIfInitiallyFetched: true})
        )
    }

    getPaginationState = createTransformer((chatId: string) => {
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

    @action
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
                    .then(({data}) => {
                        if (data.length !== 0) {
                            this.entities.insertChatParticipations(data);
                            this.paginationStateMap[chatId].initiallyFetched = true;
                            this.paginationStateMap[chatId].page = this.paginationStateMap[chatId].page + 1;
                        } else {
                            this.paginationStateMap[chatId].noMoreItems = true;
                        }
                    })
                    .finally(() => this.paginationStateMap[chatId].pending = false);
            }
        }
    }
}
