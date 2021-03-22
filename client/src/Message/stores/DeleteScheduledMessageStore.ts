import {action, computed} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api/clients";

export class DeleteScheduledMessageStore {
    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private entities: EntitiesStore,
                private chatStore: ChatStore) {
    }

    @action
    deleteScheduledMessage = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        this.entities.deleteScheduledMessage(this.selectedChatId, messageId);

        MessageApi.deleteScheduledMessage(this.selectedChatId, messageId);
    }
}
