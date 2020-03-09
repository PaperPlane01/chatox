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
        let chatIds = this.entities.chatsOfCurrentUser.ids;
        chatIds = chatIds.sort((left, right) => {
            const leftLastMessageId = this.entities.chatsOfCurrentUser.findById(right).lastMessage;
            const lastRightMessageId = this.entities.chatsOfCurrentUser.findById(left).lastMessage;

            const leftDate = leftLastMessageId
                ? this.entities.messages.findById(leftLastMessageId).createdAt
                : this.entities.chatsOfCurrentUser.findById(left).createdAt;
            const rightDate = lastRightMessageId
                ? this.entities.messages.findById(lastRightMessageId).createdAt
                : this.entities.chatsOfCurrentUser.findById(right).createdAt;

            return rightDate.getTime() - leftDate.getTime();
        });

        return chatIds;
    }

    @computed
    get totalUnreadMessagesCount(): number {
        return this.entities.chatsOfCurrentUser.ids
            .map(chatId => this.entities.chatsOfCurrentUser.findById(chatId))
            .map(chat => chat.unreadMessagesCount)
            .reduce((left, right) => left + right)
    }

    @action
    fetchChatsOfCurrentUser = (): void => {
        this.pending = false;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.insertChatsOfCurrentUser(data))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false)
    };

    @action
    setSelectedChatId = (chatId: string): void => {
        this.selectedChatId = chatId;
    }
}
