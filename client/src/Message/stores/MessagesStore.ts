import {MessageEntity} from "../types";
import {Message} from "../../api/types/response";
import {SoftDeletableEntityStore} from "../../entity-store";
import {UploadType} from "../../api/types/response/UploadType";

interface MessageUploadsStats {
    imagesCount: number,
    videosCount: number,
    audiosCount: number,
    filesCount: number
}

export class MessagesStore extends SoftDeletableEntityStore<MessageEntity, Message> {
    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        const uploadStats: MessageUploadsStats = {
            imagesCount: 0,
            audiosCount: 0,
            filesCount: 0,
            videosCount: 0
        };

        if (denormalizedEntity.uploads.length !== 0) {
            for (let upload of denormalizedEntity.uploads) {
                switch (upload.upload.type) {
                    case UploadType.FILE:
                        uploadStats.filesCount++;
                        break;
                    case UploadType.VIDEO:
                        uploadStats.videosCount++;
                        break;
                    case UploadType.IMAGE:
                    case UploadType.GIF:
                        uploadStats.imagesCount++;
                        break;
                    default:
                        uploadStats.filesCount++;
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
            uploads: denormalizedEntity.uploads.map(upload => upload.id),
            ...uploadStats
        };
    }
}
