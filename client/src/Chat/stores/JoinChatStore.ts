import {action, observable, runInAction} from "mobx";
import {ChatApi} from "../../api/clients";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStoreV2} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";

export class JoinChatStore {
    @observable
    chatId?: string = undefined;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    constructor(private readonly entities: EntitiesStoreV2,
                private readonly authorization: AuthorizationStore) {}

    @action
    joinChat = (chatId: string): void => {
        this.chatId = chatId;
        this.pending = true;
        const user = this.authorization.currentUser!;

        ChatApi.joinChat(chatId)
            .then(({data}) => {
                this.entities.chatParticipations.insert({
                    ...data,
                    chatId,
                    user: {
                        ...user,
                        deleted: false,
                        online: true
                    }
                }, {
                    increaseChatParticipantsCount: true
                });
            })
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showSnackbar = true;
            }))
            .finally(() => runInAction(() => this.pending = false));
    };

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
