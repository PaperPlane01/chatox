import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";

export class MessageDialogStore {
    messageId?: string = undefined;

    messagePending = false;

    error?: ApiError = undefined;

    get chatPending(): boolean {
        return this.chatStore.pending;
    }

    get pending(): boolean {
        return this.messagePending || this.chatPending;
    }

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.messageId,
            (messageId) => {
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
        );
    }

    setMessageId = (messageId?: string): void => {
        this.messageId = messageId;
    };

    fetchMessage = (): void => {
        if (!this.messageId || !this.selectedChatId) {
            return;
        }

        if (this.entities.messages.findByIdOptional(this.messageId)) {
            return;
        }

        this.messagePending = true;

        MessageApi.getMessage(this.selectedChatId, this.messageId)
            .then(({data}) => this.entities.messages.insert(data, {skipSettingLastMessage: true}))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.messagePending = false));
    };
}
