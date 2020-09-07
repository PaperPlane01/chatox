import {MessageEntity} from "../types";
import {Message} from "../../api/types/response";
import {SoftDeletableEntityStore} from "../../entity-store";

export class MessagesStore extends SoftDeletableEntityStore<MessageEntity, Message> {
    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
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
            uploads: denormalizedEntity.uploads.map(upload => upload.id)
        };
    }
}
