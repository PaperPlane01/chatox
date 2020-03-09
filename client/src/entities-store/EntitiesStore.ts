import {action} from "mobx";
import {ChatsOfCurrentUserEntitiesStore, MessagesStore} from "../Chat";
import {UsersStore} from "../User/stores";
import {ChatOfCurrentUser, Message} from "../api/types/response";

export class EntitiesStore {

    constructor(
        public messages: MessagesStore,
        public chatsOfCurrentUser: ChatsOfCurrentUserEntitiesStore,
        public users: UsersStore
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
        this.chatsOfCurrentUser.addMessageToChat(message.chatId, message.id);
    };

    @action
    insertChatsOfCurrentUser = (chatsOfCurrentUser: ChatOfCurrentUser[]): void => {
        chatsOfCurrentUser.forEach(chat => this.insertChatOfCurrentUser(chat));
    };

    @action
    insertChatOfCurrentUser = (chatOfCurrentUser: ChatOfCurrentUser): void => {
        this.chatsOfCurrentUser.insert(chatOfCurrentUser);

        if (chatOfCurrentUser.lastMessage) {
            this.insertMessage(chatOfCurrentUser.lastMessage);
        }

        if (chatOfCurrentUser.lastReadMessage) {
            this.insertMessage(chatOfCurrentUser.lastReadMessage);
        }
    };
}
