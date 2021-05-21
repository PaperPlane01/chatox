import {action, computed, observable} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {MessageApi} from "../../api";
import {ChatStore} from "../../Chat";

export class MarkMessageReadStore {
    @observable
    pendingMap: {[messageId: string]: boolean} = {};

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
    }

    @action
    markMessageRead = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        if (this.pendingMap[messageId]) {
            return;
        }

        const message = this.entities.messages.findByIdOptional(messageId);

        if (!message || message.readByCurrentUser) {
            return;
        }

        this.pendingMap[messageId] = true;

        MessageApi.markMessageAsRead(this.selectedChatId, messageId)
            .then(() => {
                this.entities.messages.insertEntity({...message, readByCurrentUser: true});
                this.entities.chats.decreaseUnreadMessagesCountOfChat(message.chatId);
            });
    }
}
