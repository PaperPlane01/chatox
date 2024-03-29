import {MessageEntity, MessageUploadsStats, UploadsGroupedByType} from "../types";
import {Message, UploadType} from "../../api/types/response";

export const sortMessages = (leftMessageId: string, rightMessageId: string, findMessage: (messageId: string) => MessageEntity, reverse: boolean): number => {
    const leftMessage = findMessage(leftMessageId);
    const rightMessage = findMessage(rightMessageId);

    if (reverse) {
        return rightMessage.createdAt.getTime() - leftMessage.createdAt.getTime();
    } else {
        return leftMessage.createdAt.getTime() - rightMessage.createdAt.getTime();
    }
}

export const createSortMessages = (findMessage: (id: string) => MessageEntity, reverse: boolean = false) => (leftMessageId: string, rightMessageId: string) => sortMessages(leftMessageId, rightMessageId, findMessage, reverse);

export const convertMessageToNormalizedForm = (message: Message): MessageEntity => {
    const uploadStats: MessageUploadsStats = {
        imagesCount: 0,
        audiosCount: 0,
        filesCount: 0,
        videosCount: 0,
        voiceMessagesCount: 0
    };
    const uploadsByType: UploadsGroupedByType = {
        images: [],
        audios: [],
        files: [],
        videos: [],
        voiceMessages: []
    };


    if (message.attachments.length !== 0) {
        for (let upload of message.attachments) {
            switch (upload.type) {
                case UploadType.VIDEO:
                    uploadStats.videosCount++;
                    uploadsByType.videos.push(upload.id);
                    break;
                case UploadType.IMAGE:
                case UploadType.GIF:
                    uploadStats.imagesCount++;
                    uploadsByType.images.push(upload.id);
                    break;
                case UploadType.AUDIO:
                    uploadStats.audiosCount++;
                    uploadsByType.audios.push(upload.id);
                    break;
                case UploadType.VOICE_MESSAGE:
                    uploadStats.voiceMessagesCount++;
                    uploadsByType.voiceMessages.push(upload.id);
                    break;
                case UploadType.FILE:
                default:
                    uploadStats.filesCount++;
                    uploadsByType.files.push(upload.id);
                    break;
            }
        }
    }

    return {
        id: message.id,
        createdAt: new Date(message.createdAt),
        deleted: message.deleted,
        readByCurrentUser: message.readByCurrentUser,
        referredMessageId: message.referredMessage?.id,
        sender: message.sender.id,
        text: message.text,
        updatedAt: message.updatedAt ? new Date(message.updatedAt) : undefined,
        previousMessageId: message.previousMessageId,
        nextMessageId: message.nextMessageId,
        chatId: message.chatId,
        emoji: message.emoji,
        uploads: message.attachments.map(attachment => attachment.id),
        scheduledAt: message.scheduledAt ? new Date(message.scheduledAt) : undefined,
        index: message.index,
        stickerId: message.sticker ? message.sticker.id : undefined,
        ...uploadStats,
        ...uploadsByType,
        senderRoleId: message.senderChatRole?.id,
        forwardedById: message.forwardedBy?.id,
        forwarded: Boolean(message.forwarded),
        forwardedFromChatId: message.forwardedFromChatId,
        forwardedFromMessageId: message.forwardedFromMessageId,
        readByAnyone: message.readByAnyone
    };
}
