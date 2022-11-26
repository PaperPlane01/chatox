import {action, computed, observable, runInAction} from "mobx";
import {ChatStore} from "../../Chat";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class KickChatParticipantStore {
    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
    }

    @action
    kickChatParticipant = (chatParticipantId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        this.error = undefined;

        ChatApi.deleteChatParticipation(this.selectedChatId, chatParticipantId)
            .then(() => {
                this.entities.chatParticipations.deleteById(chatParticipantId, {
                    decreaseChatParticipantsCount: true
                });
                this.setShowSnackbar(true);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => this.setShowSnackbar(true));
    };

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
