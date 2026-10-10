import {makeAutoObservable} from "mobx";
import type {EntitiesStore} from "../../entities-store";
import type {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api";

export class DeleteMessageStore {
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);
    }

    deleteMessage = (messageId: string): void => {
        if (this.selectedChatId) {
            this.entities.messages.deleteById(messageId);
            MessageApi.deleteMessage(this.selectedChatId, messageId);
        }
    };
}
