import {makeAutoObservable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {MessagesListScrollPositionsStore} from "./MessagesListScrollPositionsStore";
import {EntitiesStore} from "../../entities-store";
import {MessageApi} from "../../api";
import {ChatStore} from "../../Chat";
import {AuthorizationStore} from "../../Authorization";
import {CurrentUser} from "../../api/types/response";

export class MarkMessageReadStore {
    pendingMap: {[messageId: string]: boolean} = {};

    queues: {[chatId: string]: string[]} = {};

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly scrollPositionStore: MessagesListScrollPositionsStore,
                private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChatId,
            () => {
                if (this.selectedChatId && !this.scrollPositionStore.getScrollPosition(this.selectedChatId)) {
                    const lastMessageId = this.entities.chats.findById(this.selectedChatId).lastMessage;

                    if (lastMessageId) {
                        const message = this.entities.messages.findById(lastMessageId);

                        if (!message.readByCurrentUser) {
                            this.markMessageRead(lastMessageId)
                                .then(() => runInAction(() => this.entities.chats.setUnreadMessagesCountOfChat(message.chatId, 0)))
                        }
                    }
                }

                if (this.chatStore.previousChatId) {
                    this.markMessagesAsRead(this.chatStore.previousChatId);
                }
            }
        )
    }

    getLatestMessage = computedFn((chatId: string) => {
        const messages = this.entities.messages.findAllById(this.queues[chatId]);

        return messages.slice()
            .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())[0].id;
    })

    addMessageToQueue = (messageId: string): void => {
        if (!this.selectedChatId) {
            return;
        }

        if (!this.queues[this.selectedChatId]) {
            this.queues[this.selectedChatId] = [];
        }

        this.queues[this.selectedChatId].push(messageId);
        this.entities.chats.decreaseUnreadMessagesCountOfChat(this.selectedChatId);
    };

    markMessagesAsRead = (chatId: string): void => {
        if (!this.queues[chatId] || this.queues[chatId].length === 0) {
            return;
        }

        const latestMessageId = this.getLatestMessage(chatId);

        this.markMessageRead(latestMessageId)
            .then(() => runInAction(() => this.queues[chatId] = []));
    };

    markMessageRead = async (messageId: string): Promise<void> => {
        if (!this.selectedChatId) {
            return;
        }

        if (this.pendingMap[messageId]) {
            return;
        }

        const message = this.entities.messages.findByIdOptional(messageId);

        if (!message || message.readByCurrentUser) {
            return;
        }

        const currentUserMentioned = message.mentionedUsers.length !== 0
            && this.currentUser
            && message.mentionedUsers.includes(this.currentUser.id);
        this.pendingMap[messageId] = true;

        return MessageApi.markMessageAsRead(this.selectedChatId, messageId)
            .then(() => {
                this.entities.messages.insertEntity({...message, readByCurrentUser: true});
                this.entities.chats.decreaseUnreadMessagesCountOfChat(message.chatId, currentUserMentioned);
            });
    };
}
