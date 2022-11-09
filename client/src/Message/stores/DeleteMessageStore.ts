import {action, computed} from "mobx";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api/clients";

export class DeleteMessageStore {
    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStoreV2,
                private readonly chatStore: ChatStore) {
    }

    @action
    deleteMessage = (messageId: string): void => {
        if (this.selectedChatId) {
            this.entities.messages.deleteById(messageId);
            MessageApi.deleteMessage(this.selectedChatId, messageId);
        }
    };
}
