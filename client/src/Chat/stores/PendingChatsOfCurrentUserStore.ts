import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {makeAutoObservable, runInAction} from "mobx";
import {EntitiesStore} from "../../entities-store";

export class PendingChatsOfCurrentUserStore {
    chatsIds: string[] = [];

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    fetchPendingChats = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getPendingChatsOfCurrentUser()
            .then(({data}) => runInAction(() => {
                this.entities.chats.insertAll(data);
                this.chatsIds = data.map(chat => chat.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    addChatId = (chatId: string): void => {
        this.chatsIds.push(chatId);
    }

    removeChatId = (chatId: string): void => {
        this.chatsIds = this.chatsIds.filter(existingId => existingId !== chatId);
    }
}