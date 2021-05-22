import {MessageEmoji} from "../../api/types/response";

export interface MessageEntity {
    id: string,
    referredMessageId?: string,
    sender: string,
    text: string,
    deleted: boolean,
    createdAt: Date,
    updatedAt?: Date,
    readByCurrentUser: boolean,
    previousMessageId?: string,
    nextMessageId?: string,
    chatId: string,
    emoji: MessageEmoji,
    uploads: string[],
    images: string[],
    videos: string[],
    audios: string[],
    files: string[],
    imagesCount: number,
    audiosCount: number,
    videosCount: number,
    filesCount: number,
    scheduledAt?: Date,
    index: number
}
