import {action, computed, makeAutoObservable, makeObservable} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api/clients";

export class DeleteScheduledMessageStore {
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private entities: EntitiesStore,
                private chatStore: ChatStore) {
        makeAutoObservable(this);
    }

    deleteScheduledMessage = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        this.entities.scheduledMessages.deleteById(messageId);

        MessageApi.deleteScheduledMessage(this.selectedChatId, messageId);
    };
}
