import {observable, action} from "mobx";
import {ChatApi} from "../../api/clients";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
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

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {}

    @action
    joinChat = (chatId: string): void => {
        this.chatId = chatId;
        this.pending = true;
        const user = this.authorization.currentUser!;

        ChatApi.joinChat(chatId)
            .then(({data}) => {
                this.entities.insertChatParticipation({
                    ...data,
                    chatId,
                    user: {
                        ...user,
                        deleted: false,
                        online: true
                    }
                }, true);
            })
            .catch(error => {
                this.error = getInitialApiErrorFromResponse(error);
                this.showSnackbar = true;
            })
            .finally(() => this.pending = false)
    };

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
