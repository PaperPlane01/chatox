import {makeAutoObservable} from "mobx";
import type {EntitiesStore} from "../../entities-store";
import type {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api";

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
