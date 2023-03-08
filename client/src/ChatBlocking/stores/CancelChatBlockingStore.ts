import {makeAutoObservable, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {ChatBlockingApi} from "../../api/clients";

export class CancelChatBlockingStore {
    pendingCancellationsMap: {
        [chatBlockingId: string]: boolean
    } = {};

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    isChatBlockingCancellationPending = createTransformer((blockingId: string) => {
        return Boolean(this.pendingCancellationsMap[blockingId]);
    });

    cancelChatBlocking = (id: string): void => {
        const chatBlocking = this.entities.chatBlockings.findById(id);
        this.pendingCancellationsMap[id] = true;

        ChatBlockingApi.cancelChatBlocking(chatBlocking.chatId, id)
            .then(({data}) => this.entities.chatBlockings.insert(data))
            .finally(() => runInAction(() => this.pendingCancellationsMap[id] = false));
    };
}
