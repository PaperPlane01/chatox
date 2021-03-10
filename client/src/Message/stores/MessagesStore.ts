import {MessageEntity} from "../types";
import {Message, UploadType} from "../../api/types/response";
import {SoftDeletableEntityStore} from "../../entity-store";

interface MessageUploadsStats {
    imagesCount: number,
    videosCount: number,
    audiosCount: number,
    filesCount: number
}

interface UploadsGroupedByType {
    images: string[],
    videos: string[],
    audios: string[],
    files: string[]
}

export class MessagesStore extends SoftDeletableEntityStore<MessageEntity, Message> {
    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        const uploadStats: MessageUploadsStats = {
            imagesCount: 0,
            audiosCount: 0,
            filesCount: 0,
            videosCount: 0
        };
        const uploadsByType: UploadsGroupedByType = {
            images: [],
            audios: [],
            files: [],
            videos: []
        };


        if (denormalizedEntity.attachments.length !== 0) {
            for (let upload of denormalizedEntity.attachments) {
                switch (upload.type) {
                    case UploadType.FILE:
                        uploadStats.filesCount++;
                        uploadsByType.files.push(upload.id);
                        break;
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
                    default:
                        uploadStats.filesCount++;
                        uploadsByType.files.push(upload.id);
                        break;
                }
            }
        }

        return {
            id: denormalizedEntity.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            deleted: denormalizedEntity.deleted,
            readByCurrentUser: denormalizedEntity.readByCurrentUser,
            referredMessageId: denormalizedEntity.referredMessage && denormalizedEntity.referredMessage.id,
            sender: denormalizedEntity.sender.id,
            text: denormalizedEntity.text,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            previousMessageId: denormalizedEntity.previousMessageId,
            nextMessageId: denormalizedEntity.nextMessageId,
            chatId: denormalizedEntity.chatId,
            emoji: denormalizedEntity.emoji,
            uploads: denormalizedEntity.attachments.map(attachment => attachment.id),
            scheduledAt: denormalizedEntity.scheduledAt ? new Date(denormalizedEntity.scheduledAt) : undefined,
            ...uploadStats,
            ...uploadsByType
        };
    }
}
