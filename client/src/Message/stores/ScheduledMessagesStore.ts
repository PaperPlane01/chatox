import {AbstractEntityStore} from "../../entity-store";
import {MessageEntity} from "../types";
import {convertMessageToNormalizedForm} from "../utils";
import {Message} from "../../api/types/response";

export class ScheduledMessagesStore extends AbstractEntityStore<MessageEntity,  Message> {

    protected convertToNormalizedForm(denormalizedEntity: Message): MessageEntity {
        return convertMessageToNormalizedForm(denormalizedEntity);
    }
}
