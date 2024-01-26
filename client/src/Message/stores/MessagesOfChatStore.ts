import {makeAutoObservable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {AxiosPromise} from "axios";
import {SearchMessagesStore} from "./SearchMessagesStore";
import {createSortMessages} from "../utils";
import {ChatMessagesFetchingStateMap, MessageEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {FetchOptions} from "../../utils/types";
import {MessageApi} from "../../api";
import {Message} from "../../api/types/response";

interface FetchMessagesOptions extends FetchOptions {
    chatId?: string,
    skipSettingLastMessage?: boolean
}

const DEFAULT_FETCH_OPTIONS: FetchMessagesOptions = {
    chatId: undefined,
    skipSettingLastMessage: true,
    abortIfInitiallyFetched: true
};

export class MessagesOfChatStore {
    chatMessagesFetchingStateMap: ChatMessagesFetchingStateMap = {};

    initialMessagesMap: {[chatId: string]: number} = {};

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get messagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.isInSearchMode
                ? this.searchMessagesStore.foundMessagesIds
                : this.entities.chats.findById(this.selectedChatId).messages;
            return messages.slice().sort(createSortMessages(
                this.entities.messages.findById
            ));
        } else {
            return [];
        }
    }

    get lastMessage(): MessageEntity | undefined {
        if (!this.selectedChatId) {
            return undefined;
        }

        const messages = this.isInSearchMode
            ? this.entities.chats.findById(this.selectedChatId).messages
            : this.messagesOfChat;

        if (messages.length !== 0) {
            return this.entities.messages.findById(messages[messages.length - 1]);
        }

        return undefined;
    }

    get isInSearchMode(): boolean {
        return this.searchMessagesStore.query.trim().length !== 0;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly searchMessagesStore: SearchMessagesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChatId,
            () => this.fetchMessages({abortIfInitiallyFetched: true})
        );
    }

    getFetchingState = computedFn((chatId: string) => {
        if (this.chatMessagesFetchingStateMap[chatId]) {
            return this.chatMessagesFetchingStateMap[chatId];
        } else {
            return {
                pending: false,
                initiallyFetched: false
            }
        }
    });

    fetchMessages = async (options: FetchMessagesOptions = DEFAULT_FETCH_OPTIONS): Promise<void> => {
        const chatId = options.chatId ?? this.selectedChatId;

        if (!chatId || this.isInSearchMode) {
            return;
        }

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

        if (this.getFetchingState(chatId).initiallyFetched && this.messagesOfChat.length !== 0) {
            fetchMessageFunction = MessageApi.getMessagesByChatBeforeMessage;
            beforeMessage = this.messagesOfChat[0];
        } else {
            fetchMessageFunction = MessageApi.getMessagesByChat;
        }

        this.chatMessagesFetchingStateMap[chatId].pending = true;

        return fetchMessageFunction(chatId, beforeMessage)
            .then(({data}) => {
                runInAction(() => {
                    if (data.length !== 0) {
                        this.entities.messages.insertAll(data, {
                            skipSettingLastMessage: options.skipSettingLastMessage ?? true
                        });

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
    };
}
