import {makeAutoObservable, reaction, runInAction} from "mobx";
import {isDefined} from "../../utils/object-utils";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {ApiError, ChatInviteApi, getInitialApiErrorFromResponse} from "../../api";

export class ChatInviteDialogStore {
    inviteId?: string = undefined;

    pending = false;

    error?: ApiError = undefined;

    get open(): boolean {
        return isDefined(this.inviteId);
    }

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this)

        reaction(
            () => this.inviteId,
            inviteId => {
                if (inviteId) {
                    this.fetchChatInvite();
                }
            }
        );
    }

    openDialogToInvite = (inviteId: string): void => {
        this.inviteId = inviteId;
    }

    closeDialog = (): void => {
        this.inviteId = undefined;
    }

    fetchChatInvite = (): void => {
        if (!this.inviteId || !this.selectedChatId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ChatInviteApi.getChatInvite(this.selectedChatId, this.inviteId)
            .then(({data}) => this.entities.chatInvites.insert(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}
