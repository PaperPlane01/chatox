import {makeAutoObservable, runInAction} from "mobx";
import {ChatListEntry} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";

export class ChatsOfCurrentUserStore {
    pending = false;

    error?: ApiError;

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
            .map(chat => ({
                chatId: chat.id,
                messageId: chat.lastMessage,
                unreadMentionsCount: chat.unreadMentionsCount,
                unreadMessagesCount: chat.unreadMessagesCount
            }));
    }

    get totalUnreadMessagesCount(): number {
        return this.chatsOfCurrentUser
            .map(chat => chat.unreadMessagesCount ?? 0)
            .reduce((left, right) => left + right, 0)
    }

    get unreadChatsCount(): number {
        return this.chatsOfCurrentUser
            .filter(chat => chat.unreadMessagesCount ?? 0 !== 0)
            .length
    }

    get hasUnreadMentions(): boolean {
        return this.chatsOfCurrentUser
            .filter(chat => chat.unreadMentionsCount ?? 0 !== 0)
            .length !== 0;
    }

    fetchChatsOfCurrentUser = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.chats.insertAll(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    }
}
