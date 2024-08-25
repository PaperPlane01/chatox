import {makeAutoObservable, runInAction} from "mobx";
import {ChatListEntry, ChatOfCurrentUserEntity} from "../types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatType} from "../../api/types/response";
import {computedFn} from "mobx-utils";
import {UserEntity} from "../../User";
import {getUserDisplayedName} from "../../User/utils/labels";

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
                unreadMessagesCount: chat.unreadMessagesCount,
                chatType: chat.type
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

    get hasUnreadDialogs(): boolean {
        return this.chatsOfCurrentUser
            .filter(chat => chat.chatType === ChatType.DIALOG && (chat.unreadMessagesCount ?? 0 !== 0))
            .length !== 0;
    }

    get chatsOfCurrentUserInAlphabeticalOrder(): ChatListEntry[] {
        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .sort((left, right) => {
                const leftName = this.getChatName(left);
                const rightName = this.getChatName(right);

                return leftName.localeCompare(rightName);
            })
            .map(chat => ({
                chatId: chat.id,
                chatType: chat.type
            }));
    }

    getChatsInAlphabeticalOrder = computedFn((chatType?: ChatType): ChatListEntry[] => {
        if (!chatType) {
            return this.chatsOfCurrentUserInAlphabeticalOrder;
        }

        return this.chatsOfCurrentUserInAlphabeticalOrder.filter(chat => chat.chatType === chatType);
    })

    getChatName = computedFn((chat?: ChatOfCurrentUserEntity, user?: UserEntity): string => {
        if (!chat) {
            if (user) {
                return getUserDisplayedName(user);
            } else {
                return "";
            }
        }

        if (chat.type === ChatType.DIALOG) {
            const chatUser = user ?? this.entities.users.findById(chat.userId!);
            return getUserDisplayedName(chatUser);
        } else {
            return chat.name;
        }
    })

    fetchChatsOfCurrentUser = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.chats.insertAll(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    }
}
