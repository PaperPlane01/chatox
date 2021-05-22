import {action, computed, observable, reaction, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {createSortMessages} from "../utils";
import {ChatMessagesFetchingStateMap, MessageEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ChatsPreferencesStore, ChatStore, ReverseScrollDirectionOption} from "../../Chat";
import {FetchOptions} from "../../utils/types";
import {MessageApi} from "../../api";
import {AxiosPromise} from "axios";
import {Message} from "../../api/types/response";

export class MessagesOfChatStore {
    @observable
    chatMessagesFetchingStateMap: ChatMessagesFetchingStateMap = {};

    @observable
    initialMessagesMap: {[chatId: string]: number} = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get messagesListReverted(): boolean {
        return this.chatPreferencesStore.enableVirtualScroll
            && this.chatPreferencesStore.reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE
    }

    @computed
    get messagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.entities.chats.findById(this.selectedChatId).messages;
            return messages.slice().sort(createSortMessages(
                this.entities.messages.findById,
                this.messagesListReverted
            ));
        } else {
            return [];
        }
    }

    @computed
    get firstMessage(): MessageEntity | undefined {
        const messages = this.messagesOfChat;

        if (messages.length !== 0) {
            if (this.messagesListReverted) {
                return this.entities.messages.findById(messages[messages.length - 1]);
            } else {
                return this.entities.messages.findById(messages[0]);
            }
        }

        return undefined;
    }

    @computed
    get lastMessage(): MessageEntity | undefined {
        const messages = this.messagesOfChat;

        if (messages.length !== 0) {
            if (this.messagesListReverted) {
                return this.entities.messages.findById(messages[0]);
            } else {
                return this.entities.messages.findById(messages[messages.length - 1]);
            }
        }

        return undefined;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly chatPreferencesStore: ChatsPreferencesStore) {
        reaction(
            () => this.selectedChatId,
            () => this.fetchMessages({abortIfInitiallyFetched: true})
        )
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
        if (!this.selectedChatId) {
            return;
        }

        const chatId = this.selectedChatId;

        if (!this.chatMessagesFetchingStateMap[chatId]) {
            this.chatMessagesFetchingStateMap[chatId] = {initiallyFetched: false, pending: false};
        }

        if (this.messagesOfChat.length > 50 && !this.getFetchingState(chatId).initiallyFetched) {
            return;
        }

        if (this.getFetchingState(chatId).initiallyFetched && options.abortIfInitiallyFetched) {
            return;
        }

        let fetchMessageFunction: (...ars: any[]) => AxiosPromise<Message[]>;
        let beforeMessage: string | undefined = undefined;
        const initialLength = this.messagesOfChat.length;

        if (this.getFetchingState(chatId).initiallyFetched && this.messagesOfChat.length !== 0) {
            fetchMessageFunction = MessageApi.getMessagesByChatBeforeMessage;
            beforeMessage = this.messagesListReverted
                ? this.messagesOfChat[this.messagesOfChat.length - 1]
                : this.messagesOfChat[0];
        } else {
            fetchMessageFunction = MessageApi.getMessagesByChat;
        }

        this.chatMessagesFetchingStateMap[chatId].pending = true;

        fetchMessageFunction(chatId, beforeMessage)
            .then(({data}) => {
                runInAction(() => {
                    if (data.length !== 0) {
                        this.entities.insertMessages(data, Boolean(beforeMessage));

                        if (beforeMessage) {
                            this.initialMessagesMap[chatId] = this.initialMessagesMap[chatId]
                                ? this.initialMessagesMap[chatId] - data.length
                                : 0 - data.length;
                        }

                        this.chatMessagesFetchingStateMap[chatId].initiallyFetched = true;
                    }
                })
            })
            .finally(() => runInAction(() => this.chatMessagesFetchingStateMap[chatId].pending = false));
    }
}
