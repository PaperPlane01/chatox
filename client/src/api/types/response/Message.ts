import {User} from "./User";

export interface Message {
    id: string,
    text: string,
    referredMessage?: Message,
    sender: User,
    deleted: boolean,
    createdAt: string,
    updatedAt?: string,
    readByCurrentUser: boolean,
    chatId: string,
    previousMessageId?: string,
    nextMessageId?: string
}
