import {action, computed, observable} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";

export class ChatsOfCurrentUserStore {
    @observable
    pending = false;

    @observable
    error?: ApiError;

    @observable
    selectedChatId?: string = undefined;

    constructor(private readonly entities: EntitiesStore) {
    }

    @computed
    get chatsOfCurrentUser(): string[] {
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
            .map(chat => chat.id)
    }

    @computed
    get totalUnreadMessagesCount(): number {
        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .map(chat => chat.unreadMessagesCount)
            .reduce((left, right) => left + right)
    }

    @action
    fetchChatsOfCurrentUser = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.insertChats(data))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false)
    };

    @action
    setSelectedChatId = (chatId: string): void => {
        this.selectedChatId = chatId;
    }
}
