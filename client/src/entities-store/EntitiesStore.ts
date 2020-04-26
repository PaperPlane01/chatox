import {action, computed} from "mobx";
import {ChatsStore, ChatParticipationsStore} from "../Chat";
import {UsersStore} from "../User";
import {ChatBlocking, ChatOfCurrentUser, ChatParticipation, CurrentUser, Message, User} from "../api/types/response";
import {MessagesStore} from "../Message";
import {AuthorizationStore} from "../Authorization";
import {ChatBlockingsStore} from "../ChatBlocking/stores";

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
        public chatBlockings: ChatBlockingsStore
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

        if (this.currentUser && chatOfCurrentUser.chatParticipation) {
            this.chatParticipations.insert({
                ...chatOfCurrentUser.chatParticipation,
                user: {
                    ...this.currentUser,
                    deleted: false
                },
                chatId: chatOfCurrentUser.id
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
        const chat = this.chats.findById(chatParticipation.chatId);
        chat.participants = Array.from(new Set([...chat.participants, chatParticipation.id]));
        if (currentUser) {
            chat.currentUserParticipationId = chatParticipation.id;
            chat.participantsCount += 1;
        }
        this.chats.insertEntity(chat);
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
        this.chatBlockings.insert(chatBlocking);
    };
}
