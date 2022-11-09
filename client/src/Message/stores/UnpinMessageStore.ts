import {action, computed, observable} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ChatStore} from "../../Chat/stores";
import {EntitiesStoreV2} from "../../entities-store";
import {ChatOfCurrentUserEntity} from "../../Chat/types";

export class UnpinMessageStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    @computed
    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    constructor(private readonly entities: EntitiesStoreV2,
                private readonly chatStore: ChatStore) {
    }

    @action
    unpinMessage = (): void => {
        if (!this.selectedChat) {
            return;
        }

        if (!this.selectedChat.pinnedMessageId) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const chat = this.selectedChat;

        MessageApi.unpinMessage(this.selectedChat.id, this.selectedChat.pinnedMessageId)
            .then(({data}) => {
                this.entities.messages.insert(data);
                chat.pinnedMessageId = undefined;
                this.entities.chats.insertEntity(chat);
                this.setShowSnackbar(true);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
