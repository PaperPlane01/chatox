import {User} from "./User";

export interface ChatMessage {
    id: string,
    text: string,
    referredMessage?: ChatMessage,
    createdAt: string,
    updatedAt: string,
    chatId: string,
    deleted: boolean,
    sender: User
}
