import {action, computed, observable, reaction, runInAction} from "mobx";
import {ChatStore} from "../../Chat/stores";
import {EntitiesStore} from "../../entities-store";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {MessageApi} from "../../api/clients";
import {ClosedPinnedMessagesStore} from "./ClosedPinnedMessagesStore";

interface PinnedMessagesStateMap {
    [chatId: string]: {
        initiallyFetched: boolean,
        pending: boolean
    }
}

export class PinnedMessagesStore {
    @observable
    pinnedMessagesStateMap: PinnedMessagesStateMap = {};

    @computed
    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    @computed
    get currentPinnedMessageId(): string | undefined {
        if (this.selectedChat) {
            return this.selectedChat.pinnedMessageId;
        }

        return undefined;
    }

    @computed
    get currentPinnedMessageIsClosed(): boolean {
        if (!this.currentPinnedMessageId) {
            return false;
        }

        return Boolean(this.closedPinnedMessagesStore.closePinnedMessagesMap[this.currentPinnedMessageId]);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly closedPinnedMessagesStore: ClosedPinnedMessagesStore) {
        reaction(
            () => this.selectedChat,
            selectedChat => {
                if (selectedChat) {
                    this.fetchPinnedMessageByChat(selectedChat.id);
                }
            }
        );
    }

    @action
    fetchPinnedMessageByChat = (chatId: string): void => {
        if (this.pinnedMessagesStateMap[chatId] && (this.pinnedMessagesStateMap[chatId].pending || this.pinnedMessagesStateMap[chatId].initiallyFetched)) {
            return;
        }

        this.pinnedMessagesStateMap[chatId] = {
            initiallyFetched: false,
            pending: true
        };

        MessageApi.getPinnedMessageByChat(chatId)
            .then(({data}) => runInAction(() => {
                this.entities.messages.insert(data, {skipSettingLastMessage: true, pinnedMessageId: data.id});

                this.pinnedMessagesStateMap[chatId] = {
                    initiallyFetched: true,
                    pending: false
                };
            }))
            .catch(error => runInAction(() => {
                if (error.response && error.response === 404) {
                    this.pinnedMessagesStateMap[chatId] = {
                        initiallyFetched: true,
                        pending: false
                    };
                }
            }));
    }
}
