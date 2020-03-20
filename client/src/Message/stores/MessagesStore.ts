import {MessageEntity} from "../types";
import {Message} from "../../api/types/response";
import {AbstractEntityStore} from "../../entity-store";

export class MessagesStore extends AbstractEntityStore<MessageEntity, Message> {
    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        return {
            id: denormalizedEntity.id,
            createdAt: new Date(denormalizedEntity.createdAt),
            deleted: denormalizedEntity.deleted,
            readByCurrentUser: denormalizedEntity.readByCurrentUser,
            referredMessage: denormalizedEntity.referredMessage && denormalizedEntity.referredMessage.id,
            sender: denormalizedEntity.sender.id,
            text: denormalizedEntity.text,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            previousMessageId: denormalizedEntity.previousMessageId,
            nextMessageId: denormalizedEntity.nextMessageId
        };
    }
}
