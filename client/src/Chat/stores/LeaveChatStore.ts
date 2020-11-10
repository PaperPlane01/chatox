import {action, observable} from "mobx";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class LeaveChatStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entitiesStore: EntitiesStore) {
    }

    @action
    leaveChat = (chatId: string, chatParticipationId: string): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.leaveChat(chatId)
            .then(() => this.entitiesStore.deleteChatParticipation(chatParticipationId))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }
}
