import {observable, action, computed, runInAction, reaction} from "mobx";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";

export class MessageDialogStore {
    @observable
    messageId?: string = undefined;

    @observable
    messagePending = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get chatPending(): boolean {
        return this.chatStore.pending;
    }

    @computed
    get pending(): boolean {
        return this.messagePending || this.chatPending;
    }

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        reaction(
            () => this.messageId,
            (messageId) => {
                console.log("reacting")
                if (messageId) {
                    this.fetchMessage();
                }
            }
        );

        reaction(
            () => this.selectedChatId,
            () => {
                if (this.messageId) {
                    this.fetchMessage();
                }
            }
        )
    }

    @action
    setMessageId = (messageId?: string): void => {
        this.messageId = messageId;
    }

    @action
    fetchMessage = (): void => {
        if (!this.messageId || !this.selectedChatId) {
            return;
        }

        if (this.entities.messages.findByIdOptional(this.messageId)) {
            return;
        }

        this.messagePending = true;

        MessageApi.getMessage(this.selectedChatId, this.messageId)
            .then(({data}) => this.entities.insertMessage(data, true))
            .catch(error => runInAction(() => {
                console.error("Caught error!")
                this.error = getInitialApiErrorFromResponse(error)
            }))
            .finally(() => runInAction(() => this.messagePending = false));
    }
}
