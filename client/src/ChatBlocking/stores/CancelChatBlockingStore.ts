import {observable, action} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {ChatBlockingApi} from "../../api/clients";

export class CancelChatBlockingStore {
    @observable
    pendingCancellationsMap: {
        [chatBlockingId: string]: boolean
    } = {};

    constructor(private readonly entities: EntitiesStore) {}

    isChatBlockingCancellationPending = createTransformer((blockingId: string) => {
        return Boolean(this.pendingCancellationsMap[blockingId]);
    });

    @action
    cancelChatBlocking = (id: string): void => {
        const chatBlocking = this.entities.chatBlockings.findById(id);
        this.pendingCancellationsMap[id] = true;

        ChatBlockingApi.cancelChatBlocking(chatBlocking.chatId, id)
            .then(({data}) => this.entities.chatBlockings.insert(data))
            .finally(() => this.pendingCancellationsMap[id] = false);
    }
}