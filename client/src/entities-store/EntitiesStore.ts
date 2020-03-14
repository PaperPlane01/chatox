import {action, computed} from "mobx";
import {ChatsStore, ChatParticipationsStore, MessagesStore} from "../Chat";
import {UsersStore} from "../User/stores";
import {ChatOfCurrentUser, ChatParticipation, CurrentUser, Message} from "../api/types/response";
import {AuthorizationStore} from "../Authorization/stores";

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
        public chatParticipations: ChatParticipationsStore
    ) {
    }

    @action
    insertMessages = (messages: Message[]): void => {
        messages.forEach(message => this.insertMessage(message));
    };

    @action
    insertMessage = (message: Message): void => {
        this.users.insert(message.sender);

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
        this.chats.insert(chatOfCurrentUser);

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
            this.chats.findById(chatOfCurrentUser.id)
                .participants
                .push(chatOfCurrentUser.chatParticipation.id);
        }
    };

    @action
    insertChatParticipations = (chatParticipations: ChatParticipation[]): void => {
        chatParticipations.forEach(chatParticipation => this.insertChatParticipation(chatParticipation));
    };

    @action
    insertChatParticipation = (chatParticipation: ChatParticipation): void => {
        this.users.insert(chatParticipation.user);
        this.chatParticipations.insert(chatParticipation);
        const chat = this.chats.findById(chatParticipation.chatId);
        chat.participants = Array.from(new Set([...chat.participants, chatParticipation.id]));
        this.chats.insertEntity(chat);
    }
}
