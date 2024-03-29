import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ClosedPinnedMessagesStore} from "./ClosedPinnedMessagesStore";
import {ChatStore, ChatOfCurrentUserEntity} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {MessageApi} from "../../api";

interface PinnedMessagesStateMap {
    [chatId: string]: {
        initiallyFetched: boolean,
        pending: boolean
    }
}

export class PinnedMessagesStore {
    pinnedMessagesStateMap: PinnedMessagesStateMap = {};

    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (this.chatStore.selectedChatId) {
            return this.entities.chats.findById(this.chatStore.selectedChatId);
        }

        return undefined;
    }

    get currentPinnedMessageId(): string | undefined {
        if (this.selectedChat) {
            return this.selectedChat.pinnedMessageId;
        }

        return undefined;
    }

    get currentPinnedMessageIsClosed(): boolean {
        if (!this.currentPinnedMessageId) {
            return false;
        }

        return Boolean(this.closedPinnedMessagesStore.closePinnedMessagesMap[this.currentPinnedMessageId]);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly closedPinnedMessagesStore: ClosedPinnedMessagesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChat,
            selectedChat => {
                if (selectedChat) {
                    this.fetchPinnedMessageByChat(selectedChat.id);
                }
            }
        );
    }

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
                this.entities.messages.insert(data, {
                    skipSettingLastMessage: true,
                    skipUpdatingChat: false,
                    pinnedMessageId: data.id
                });

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
    };
}
