import {MessageEmojiResponse} from "./message-emoji.response";
import {UserResponse} from "../../../users/types/responses/user.response";
import {UploadResponse} from "../../../common/types";

export interface MessageResponse {
    id: string,
    text: string,
    referredMessage?: MessageResponse,
    sender: UserResponse,
    deleted: boolean,
    createdAt: string,
    updatedAt?: string,
    readByCurrentUser: boolean,
    chatId: string,
    previousMessageId?: string,
    nextMessageId?: string,
    emoji: MessageEmojiResponse,
    attachments: UploadResponse[],
    pinnedAt: string,
    scheduledAt?: string
}
