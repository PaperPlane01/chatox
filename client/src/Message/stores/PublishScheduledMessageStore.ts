import {makeAutoObservable, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";

export class PublishScheduledMessageStore {
    pendingMessagesMap: {[messageId: string]: boolean} = {};

    showSnackbar: boolean = false;

    error?: ApiError = undefined;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);
    }

    publishScheduledMessage = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        const chatId = this.selectedChatId;
        this.pendingMessagesMap[messageId] = true;
        this.error = undefined;

        MessageApi.publishScheduledMessage(chatId, messageId)
            .then(({data}) => {
                this.entities.chats.removeScheduledMessageFromChat(chatId, messageId);
                this.entities.scheduledMessages.deleteById(messageId);
                this.entities.messages.insert(data);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => {
                this.pendingMessagesMap[messageId] = false;
                this.setShowSnackbar(true);
            });
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
