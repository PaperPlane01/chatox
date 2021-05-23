import {MessageEntity} from "../types";
import {convertMessageToNormalizedForm} from "../utils";
import {Message} from "../../api/types/response";
import {SoftDeletableEntityStore} from "../../entity-store";

export class MessagesStore extends SoftDeletableEntityStore<MessageEntity, Message> {

    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        return convertMessageToNormalizedForm(denormalizedEntity);
    }
}
