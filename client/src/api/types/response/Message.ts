import {User} from "./User";
import {MessageEmoji} from "./MessageEmoji";
import {Upload} from "./Upload";
import {Sticker} from "./Sticker";
import {ChatRole} from "./ChatRole";

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
    attachments: Upload<any>[],
    pinnedAt?: string,
    scheduledAt?: string,
    index: number,
    sticker?: Sticker,
    senderChatRole?: ChatRole,
    forwarded?: boolean,
    forwardedFromChatId?: string,
    forwardedFromMessageId?: string,
    forwardedBy?: User,
    readByAnyone: boolean
}
