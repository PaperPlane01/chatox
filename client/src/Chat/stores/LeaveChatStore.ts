import {makeAutoObservable, runInAction} from "mobx";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class LeaveChatStore {
    pending: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);
    }

    leaveChat = (chatId: string, chatParticipationId: string): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.leaveChat(chatId)
            .then(() => this.entities.chatParticipations.deleteById(chatParticipationId, {decreaseChatParticipantsCount: true}))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };
}
