import {action, computed, observable, reaction} from "mobx";
import {ChatStore} from "../../Chat/stores";
import {EntitiesStore} from "../../entities-store";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {MessageApi} from "../../api/clients";
import {MessageEntity} from "../types";
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
                protected readonly closedPinnedMessagesStore: ClosedPinnedMessagesStore) {
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
            .then(({data}) => {
                this.entities.insertMessage(data);
                const chat = this.entities.chats.findByIdOptional(chatId);

                if (chat) {
                    chat.pinnedMessageId = data.id;
                    this.entities.chats.insertEntity(chat);
                }

                this.pinnedMessagesStateMap[chatId] = {
                    initiallyFetched: true,
                    pending: false
                };
            })
            .catch(error => {
                if (error.response && error.response === 404) {
                    this.pinnedMessagesStateMap[chatId] = {
                        initiallyFetched: true,
                        pending: false
                    };
                }
            });
    }
}
