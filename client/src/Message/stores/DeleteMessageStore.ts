import {makeAutoObservable} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {MessageApi} from "../../api/clients";

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
