import {makeAutoObservable} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ChatStore} from "../../Chat/stores";
import {EntitiesStore} from "../../entities-store";
import {ChatOfCurrentUserEntity} from "../../Chat/types";

export class UnpinMessageStore {
    pending: boolean = false;

    error?: ApiError = undefined;

    showSnackbar: boolean = false;

    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);
    }

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
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
