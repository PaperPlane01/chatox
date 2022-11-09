import {action, computed, observable} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";

export class PublishScheduledMessageStore {
    @observable
    pendingMessagesMap: {[messageId: string]: boolean} = {};

    @observable
    showSnackbar: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
    }

    @action
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
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => {
                this.pendingMessagesMap[messageId] = false;
                this.setShowSnackbar(true);
            });
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
