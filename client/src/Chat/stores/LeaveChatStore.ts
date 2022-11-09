import {action, observable, runInAction} from "mobx";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStoreV2} from "../../entities-store";

export class LeaveChatStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStoreV2) {
    }

    @action
    leaveChat = (chatId: string, chatParticipationId: string): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.leaveChat(chatId)
            .then(() => this.entities.chatParticipations.deleteById(chatParticipationId, {decreaseChatParticipantsCount: true}))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}
