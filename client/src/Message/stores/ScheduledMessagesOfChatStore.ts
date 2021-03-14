import {action, computed, observable, reaction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatMessagesFetchingStateMap} from "../types";
import {createSortMessages} from "../utils";
import {ChatStore} from "../../Chat/stores";
import {EntitiesStore} from "../../entities-store";
import {FetchOptions} from "../../utils/types";
import {MessageApi} from "../../api/clients";

export class ScheduledMessagesOfChatStore {
    @observable
    fetchingStateMap: ChatMessagesFetchingStateMap = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get scheduledMessagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.entities.chats.findById(this.selectedChatId).scheduledMessages;

            return messages.slice().sort(createSortMessages(
                this.entities.scheduledMessages.findById,
                false
            ));
        } else {
            return [];
        }
    }

    private reactToChatIdChange: boolean = false;

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        reaction(
            () => this.selectedChatId,
            chatId => {
                if (chatId && this.reactToChatIdChange) {
                    this.fetchScheduledMessages();
                }
            }
        );
    }

    getFetchingState = createTransformer((chatId: string) => {
        if (this.fetchingStateMap[chatId]) {
            return this.fetchingStateMap[chatId];
        } else {
            return {
                pending: false,
                initiallyFetched: false
            }
        }
    });

    @action
    fetchScheduledMessages = (options: FetchOptions = {abortIfInitiallyFetched: false}): void => {
        if (!this.selectedChatId) {
            return;
        }

        const chatId = this.selectedChatId;

        if (!this.fetchingStateMap[chatId]) {
            this.fetchingStateMap[chatId] = {pending: false, initiallyFetched: false};
        }

        if (this.getFetchingState(chatId).initiallyFetched && options.abortIfInitiallyFetched) {
            return;
        }

        this.fetchingStateMap[chatId].pending = true;

        MessageApi.getScheduledMessagesByChat(chatId)
            .then(({data}) => {
                if (data.length !== 0) {
                    this.entities.insertMessages(data);
                }
                this.fetchingStateMap[chatId].initiallyFetched = true;
            })
            .finally(() => this.fetchingStateMap[chatId].pending = false);
    }

    @action
    setReactToChatIdChange = (reactToChatIdChange: boolean): void => {
        this.reactToChatIdChange = reactToChatIdChange;
    }
}
