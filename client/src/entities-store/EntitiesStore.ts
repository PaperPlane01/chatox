import {action, computed} from "mobx";
import {ChatParticipationEntity, ChatParticipationsStore, ChatsStore, ChatUploadsStore} from "../Chat";
import {UsersStore} from "../User";
import {
    Chat,
    ChatBlocking,
    ChatOfCurrentUser,
    ChatParticipation,
    ChatRole,
    CurrentUser,
    Message,
    User
} from "../api/types/response";
import {MessagesStore} from "../Message";
import {AuthorizationStore} from "../Authorization";
import {ChatBlockingsStore} from "../ChatBlocking/stores";
import {UploadsStore} from "../Upload/stores";
import {ChatUpdated} from "../api/types/websocket";
import {PartialBy} from "../utils/types";

type DecreaseChatParticipantsCountCallback = (chatParticipation?: ChatParticipationEntity, currentUser?: CurrentUser) => boolean;

export class EntitiesStore {
    private authorizationStore: AuthorizationStore;

    setAuthorizationStore = (authorizationStore: AuthorizationStore): void => {
        this.authorizationStore = authorizationStore;
    };

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    constructor(
        public messages: MessagesStore,
        public chats: ChatsStore,
        public users: UsersStore,
        public chatParticipations: ChatParticipationsStore,
        public chatBlockings: ChatBlockingsStore,
        public uploads: UploadsStore,
        public chatUploads: ChatUploadsStore
    ) {
    }

    @action
    insertMessages = (messages: Message[]): void => {
        messages.reverse().forEach((message, index, messagesArray) => {
            if (index !== 0) {
                message.previousMessageId = messagesArray[index - 1].id;
            }

            if (index !== messages.length - 1) {
                message.nextMessageId = messagesArray[index + 1].id;
            }

            this.insertMessage(message);
        });
    };

    @action
    insertMessage = (message: Message): void => {
        this.insertUser(message.sender);

        if (message.referredMessage) {
            this.insertMessage(message.referredMessage);
        }

        this.uploads.insertAll(message.uploads.map(chatUpload => chatUpload.upload));
        this.chatUploads.insertAll(message.uploads);
        this.messages.insert(message);
        this.chats.addMessageToChat(message.chatId, message.id);
    };

    @action
    updateChat = (chatUpdated: ChatUpdated): void => {
        const chat = this.chats.findByIdOptional(chatUpdated.id);

        if (chat) {
            if (chatUpdated.avatar) {
                this.uploads.insert(chatUpdated.avatar);
            }

            chat.name = chatUpdated.name;
            chat.slug = chatUpdated.slug;
            chat.avatarId = chatUpdated.avatar ? chatUpdated.avatar.id : undefined;
            chat.description = chatUpdated.description;

            this.chats.insertEntity(chat);
        }
    };

    @action
    insertChats = (chatsOfCurrentUser: PartialBy<ChatOfCurrentUser, "unreadMessagesCount" | "deleted">[]): void => {
        chatsOfCurrentUser.forEach(chat => this.insertChat({
            ...chat,
            deleted: chat.deleted === undefined ? false : chat.deleted
        }));
    };

    @action
    insertChat = (chat: PartialBy<ChatOfCurrentUser, "unreadMessagesCount">): void => {
        let unreadMessagesCount: number;

        if (chat.unreadMessagesCount === undefined || chat.unreadMessagesCount === null) {
            const existingChat = this.chats.findByIdOptional(chat.id);

            if (existingChat) {
                unreadMessagesCount = existingChat.unreadMessagesCount;
            } else {
                unreadMessagesCount = 0;
            }
        } else {
            unreadMessagesCount = chat.unreadMessagesCount;
        }

        const chatEntity = this.chats.insert({...chat, unreadMessagesCount});

        if (chat.lastMessage) {
            this.insertMessage(chat.lastMessage);
        }

        if (chat.lastReadMessage) {
            this.insertMessage(chat.lastReadMessage);
        }

        if (chat.avatar) {
            this.uploads.insert(chat.avatar);
        }

        if (this.currentUser && chat.chatParticipation) {
            if (chat.chatParticipation.activeChatBlocking) {
                this.chatBlockings.insert(chat.chatParticipation.activeChatBlocking);
            }

            this.chatParticipations.insert({
                ...chat.chatParticipation,
                user: {
                    ...this.currentUser,
                    deleted: false,
                    online: true
                },
                chatId: chat.id,
                activeChatBlocking: chat.chatParticipation.activeChatBlocking
            });

            chatEntity.participants = Array.from(new Set([
                ...chatEntity.participants,
                chat.chatParticipation.id
            ]))
        }
    };

    @action
    insertChatParticipations = (chatParticipations: ChatParticipation[]): void => {
        chatParticipations.forEach(chatParticipation => this.insertChatParticipation(chatParticipation));
    };

    @action
    insertChatParticipation = (chatParticipation: ChatParticipation, currentUser: boolean = false): void => {
        this.insertUser(chatParticipation.user);
        this.chatParticipations.insert(chatParticipation);
        const chat = this.chats.findByIdOptional(chatParticipation.chatId);
        if (chat && currentUser) {
            chat.currentUserParticipationId = chatParticipation.id;
            this.chats.increaseChatParticipantsCount(chat.id);
        }
    };

    @action
    deleteChatParticipation = (id: string, decreaseChatParticipantsCount: boolean | DecreaseChatParticipantsCountCallback = false, chatId?: string): void => {
        const chatParticipation = this.chatParticipations.findById(id);

        if (chatParticipation) {
            const chat = this.chats.findById(chatParticipation.chatId);

            if (chat.currentUserParticipationId === id) {
                chat.currentUserParticipationId = undefined;
            }

            this.chatParticipations.deleteById(id);

            if (typeof decreaseChatParticipantsCount === "function") {
                if (decreaseChatParticipantsCount(chatParticipation, this.authorizationStore.currentUser)) {
                    this.chats.decreaseChatParticipantsCount(chat.id);
                }
            } else if (decreaseChatParticipantsCount) {
                this.chats.decreaseChatParticipantsCount(chat.id);
            }
        } else if (chatId) {
            if (typeof decreaseChatParticipantsCount === "function") {
                if (decreaseChatParticipantsCount(undefined, this.currentUser)) {
                    this.chats.decreaseChatParticipantsCount(chatId);
                }
            } else if (decreaseChatParticipantsCount) {
                this.chats.decreaseChatParticipantsCount(chatId);
            }
        }
    };

    @action
    insertUser = (user: User): void => {
        if (user.avatar) {
            this.uploads.insert(user.avatar);
        }

        this.users.insert(user);
    };

    @action
    insertChatBlockings = (chatBlockings: ChatBlocking[]): void => {
        chatBlockings.forEach(blocking => this.insertChatBlocking(blocking));
    };

    @action
    insertChatBlocking = (chatBlocking: ChatBlocking): void => {
        this.insertUser(chatBlocking.blockedUser);
        this.insertUser(chatBlocking.blockedBy);
        chatBlocking.canceledBy && this.insertUser(chatBlocking.canceledBy);
        chatBlocking.lastModifiedBy && this.insertUser(chatBlocking.lastModifiedBy);
        const chatBlockingEntity = this.chatBlockings.insert(chatBlocking);

        if (this.authorizationStore.currentUser && chatBlockingEntity.blockedUserId === this.authorizationStore.currentUser.id) {
            const chatParticipation = this.chatParticipations.findByUserAndChat({
                userId: this.authorizationStore.currentUser.id,
                chatId: chatBlockingEntity.chatId
            });
            if (chatParticipation && chatParticipation.role === ChatRole.USER) {
                chatParticipation.activeChatBlockingId = chatBlockingEntity.id;
                this.chatParticipations.insertEntity(chatParticipation);
            }
        }
    };
}
