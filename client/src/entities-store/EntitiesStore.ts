import {action, computed} from "mobx";
import {ChatParticipationsStore, ChatsStore} from "../Chat";
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
        public uploads: UploadsStore
    ) {
    }

    @action
    insertMessages = (messages: Message[]): void => {
        messages.forEach((message, index, messagesArray) => {
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
    insertChats = (chatsOfCurrentUser: ChatOfCurrentUser[]): void => {
        chatsOfCurrentUser.forEach(chat => this.insertChat(chat));
    };

    @action
    insertChat = (chatOfCurrentUser: ChatOfCurrentUser): void => {
        const chat = this.chats.insert(chatOfCurrentUser);

        if (chatOfCurrentUser.lastMessage) {
            this.insertMessage(chatOfCurrentUser.lastMessage);
        }

        if (chatOfCurrentUser.lastReadMessage) {
            this.insertMessage(chatOfCurrentUser.lastReadMessage);
        }

        if (chatOfCurrentUser.avatar) {
            this.uploads.insert(chatOfCurrentUser.avatar);
        }

        if (this.currentUser && chatOfCurrentUser.chatParticipation) {
            if (chatOfCurrentUser.chatParticipation.activeChatBlocking) {
                this.chatBlockings.insert(chatOfCurrentUser.chatParticipation.activeChatBlocking);
            }

            this.chatParticipations.insert({
                ...chatOfCurrentUser.chatParticipation,
                user: {
                    ...this.currentUser,
                    deleted: false,
                    online: true
                },
                chatId: chatOfCurrentUser.id,
                activeChatBlocking: chatOfCurrentUser.chatParticipation.activeChatBlocking
            });

            chat.participants = Array.from(new Set([
                ...chat.participants,
                chatOfCurrentUser.chatParticipation.id
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
            chat.participantsCount += 1;
            this.chats.insertEntity(chat);
        }
    };

    @action
    insertUser = (user: User): void => {
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
