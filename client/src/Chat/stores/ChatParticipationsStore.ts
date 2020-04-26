import {createTransformer} from "mobx-utils";
import {ChatParticipationEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {ChatParticipation} from "../../api/types/response";

export interface FindChatParticipationByUserAndChatOptions {
    userId: string,
    chatId: string
}

export class ChatParticipationsStore extends AbstractEntityStore<ChatParticipationEntity, ChatParticipation> {
    findByUserAndChat = createTransformer((options: FindChatParticipationByUserAndChatOptions) => {
        return this.ids.map(id => this.findById(id))
            .find(chatParticipation => chatParticipation.chatId === options.chatId
                && chatParticipation.userId === options.userId)
    });

    protected convertToNormalizedForm(denormalizedEntity: ChatParticipation): ChatParticipationEntity {
        return {
            id: denormalizedEntity.id,
            chatId: denormalizedEntity.chatId,
            role: denormalizedEntity.role,
            userId: denormalizedEntity.user.id
        };
    }

}
