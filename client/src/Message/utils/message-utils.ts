import {MessageEntity, MessageUploadsStats, UploadsGroupedByType} from "../types";
import {Message, Upload, UploadType} from "../../api/types/response";

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
    const uploadsByType = splitUploads(message.attachments);

    const uploadStats: MessageUploadsStats = {
        imagesCount: uploadsByType.images.length,
        audiosCount: uploadsByType.audios.length,
        filesCount: uploadsByType.files.length,
        videosCount: uploadsByType.videos.length,
        voiceMessagesCount: uploadsByType.voiceMessages.length
    };

    return {
        id: message.id,
        createdAt: new Date(message.createdAt),
        deleted: message.deleted,
        messageDeleted: message.deleted,
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
        readByAnyone: message.readByAnyone,
        mentionedUsers: message.mentionedUsers.map(user => user.id)
    };
};

export const splitUploads = (uploads: Array<Upload<any>>): UploadsGroupedByType => {
    const allUploads: string[] = [];
    const images: string[] = [];
    const voiceMessages: string[] = [];
    const audios: string[] = [];
    const files: string[] = [];
    const videos: string[] = [];

    for (let upload of uploads) {
        allUploads.push(upload.id);
        switch (upload.type) {
            case UploadType.IMAGE:
            case UploadType.GIF:
                images.push(upload.id);
                break;
            case UploadType.AUDIO:
                audios.push(upload.id);
                break;
            case UploadType.VOICE_MESSAGE:
                voiceMessages.push(upload.id);
                break;
            case UploadType.VIDEO:
                videos.push(upload.id);
                break;
            case UploadType.FILE:
            default:
                files.push(upload.id);
                break;
        }
    }

    return {
        allUploads,
        images,
        voiceMessages,
        videos,
        audios,
        files
    };
};
