import {makeAutoObservable, runInAction} from "mobx";
import {ChatListEntry} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";

export class ChatsOfCurrentUserStore {
    pending = false;

    error?: ApiError;

    selectedChatId?: string = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    get chatsOfCurrentUser(): ChatListEntry[] {
        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .sort((left, right) => {
                const leftLastMessageId = left.lastMessage;
                const rightLastMessageId = right.lastMessage;

                const leftDate = leftLastMessageId
                    ? this.entities.messages.findById(leftLastMessageId).createdAt
                    : left.createdAt;
                const rightDate = rightLastMessageId
                    ? this.entities.messages.findById(rightLastMessageId).createdAt
                    : right.createdAt;

                return rightDate.getTime() - leftDate.getTime();
            })
            .map(chat => ({chatId: chat.id, messageId: chat.lastMessage}))
    }

    get totalUnreadMessagesCount(): number {
        if (this.entities.chats.ids.length === 0) {
            return 0;
        }

        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .map(chat => chat.unreadMessagesCount)
            .reduce((left, right) => left + right, 0)
    }

    get unreadChatsCount(): number {
        if (this.entities.chats.ids.length === 0) {
            return 0;
        }

        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId) && chat.unreadMessagesCount !== 0)
            .length;
    }

    fetchChatsOfCurrentUser = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.chats.insertAll(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    };

    setSelectedChatId = (chatId: string): void => {
        this.selectedChatId = chatId;
    };
}
