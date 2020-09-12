import {User} from "./User";
import {MessageEmoji} from "./MessageEmoji";
import {ChatUploadAttachment} from "./ChatUploadAttachment";

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
    nextMessageId?: string,
    emoji: MessageEmoji,
    uploads: ChatUploadAttachment[]
}
