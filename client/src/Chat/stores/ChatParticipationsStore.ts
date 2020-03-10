import {AbstractEntityStore} from "../../entity-store";
import {ChatParticipationEntity} from "../types/ChatParticipationEntity";
import {ChatParticipation} from "../../api/types/response";

export class ChatParticipationsStore extends AbstractEntityStore<ChatParticipationEntity, ChatParticipation> {

    protected convertToNormalizedForm(denormalizedEntity: ChatParticipation): ChatParticipationEntity {
        return {
            id: denormalizedEntity.id,
            chatId: denormalizedEntity.chatId,
            role: denormalizedEntity.role,
            userId: denormalizedEntity.user.id
        };
    }

}
