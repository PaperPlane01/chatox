import {action, computed, observable, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat/stores";
import {ChatOfCurrentUserEntity} from "../../Chat/types";

export class PinMessageStore {
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

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
    }

    @action
    pinMessage = (messageId: string): void => {
        if (!this.selectedChat) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.pinMessage(this.selectedChat.id, messageId)
            .then(({data}) => {
                if (this.selectedChat) {
                    this.entities.messages.insert(data, {skipSettingLastMessage: true});

                    const chat = this.entities.chats.findById(this.selectedChat.id);
                    chat.pinnedMessageId = data.id;
                    this.entities.chats.insertEntity(chat);
                    this.setShowSnackbar(true);
                }
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
