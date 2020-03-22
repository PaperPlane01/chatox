import {action, reaction, observable, computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {FetchingState, FetchOptions} from "../../utils/types";
import {MessageApi} from "../../api/clients";

interface ChatMessagesFetchingStateMap {
    [chatId: string]: FetchingState
}

export class MessagesOfChatStore {
    @observable
    chatMessagesFetchingStateMap: ChatMessagesFetchingStateMap = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        reaction(
            () => this.selectedChatId,
            () => this.fetchMessages({abortIfInitiallyFetched: true})
        )
    }

    @computed
    get messagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.entities.chats.findById(this.selectedChatId).messages;
            return messages.sort((left, right) => {
                const leftMessage = this.entities.messages.findById(left);
                const rightMessage = this.entities.messages.findById(right);

                return leftMessage.createdAt.getTime() - rightMessage.createdAt.getTime();
            })
        } else {
            return [];
        }
    }

    getFetchingState = createTransformer((chatId: string) => {
        if (this.chatMessagesFetchingStateMap[chatId]) {
            return this.chatMessagesFetchingStateMap[chatId];
        } else {
            return {
                pending: false,
                initiallyFetched: false
            }
        }
    });

    @action
    fetchMessages = (options: FetchOptions = {abortIfInitiallyFetched: false}): void => {
        console.log("in fetchMessages()");
        if (this.selectedChatId) {
            if (this.messagesOfChat.length > 50) {
                return;
            }

            const chatId = this.selectedChatId;

            if (!this.chatMessagesFetchingStateMap[chatId]) {
                this.chatMessagesFetchingStateMap[chatId] = {initiallyFetched: false, pending: false};
            }

            if (this.getFetchingState(chatId).initiallyFetched && options.abortIfInitiallyFetched) {
                return;
            }

            this.chatMessagesFetchingStateMap[chatId].pending = true;

            MessageApi.getMessagesByChat(chatId)
                .then(({data}) => {
                    if (data.length !== 0) {
                        this.entities.insertMessages(data);
                    }
                    this.chatMessagesFetchingStateMap[chatId].initiallyFetched = true;
                })
                .finally(() => this.chatMessagesFetchingStateMap[chatId].pending = false)
        }
    }
}
