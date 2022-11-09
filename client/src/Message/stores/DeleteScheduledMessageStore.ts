import {action, computed} from "mobx";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api/clients";

export class DeleteScheduledMessageStore {
    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private entities: EntitiesStoreV2,
                private chatStore: ChatStore) {
    }

    @action
    deleteScheduledMessage = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        this.entities.scheduledMessages.deleteById(messageId);

        MessageApi.deleteScheduledMessage(this.selectedChatId, messageId);
    }
}
