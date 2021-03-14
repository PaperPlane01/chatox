import {action, computed, observable, reaction} from "mobx";
import {createTransformer} from "mobx-utils";
import {AxiosPromise} from "axios";
import {EntitiesStore} from "../../entities-store";
import {ChatsPreferencesStore, ChatStore, ReverseScrollDirectionOption} from "../../Chat";
import {createSortMessages} from "../utils";
import {ChatMessagesFetchingStateMap} from "../types";
import {FetchOptions} from "../../utils/types";
import {MessageApi} from "../../api/clients";
import {Message} from "../../api/types/response";

export class MessagesOfChatStore {
    @observable
    chatMessagesFetchingStateMap: ChatMessagesFetchingStateMap = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly chatPreferencesStore: ChatsPreferencesStore) {
        reaction(
            () => this.selectedChatId,
            () => this.fetchMessages({abortIfInitiallyFetched: true})
        )
    }

    @computed
    get messagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.entities.chats.findById(this.selectedChatId).messages;
            return messages.slice().sort(createSortMessages(
                this.entities.messages.findById,
                this.chatPreferencesStore.enableVirtualScroll
                && this.chatPreferencesStore.reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE
            ));
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
