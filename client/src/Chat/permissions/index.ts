import {ChatOfCurrentUserEntity, ChatParticipationEntity} from "../types";
import {ChatRole} from "../../api/types/response";

export const canUpdateChat = (chat: ChatOfCurrentUserEntity): boolean => {
    return chat.createdByCurrentUser;
};

export const canLeaveChat = (chat: ChatOfCurrentUserEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && !chat.createdByCurrentUser);
};

export const canKickChatParticipant = (
    participantToKick: ChatParticipationEntity,
    currentUserChatParticipation?: ChatParticipationEntity
): boolean => {
    if (!currentUserChatParticipation) {
        return false;
    }

    if (participantToKick.role !== ChatRole.USER) {
        return false;
    }

    return currentUserChatParticipation.role === ChatRole.MODERATOR || currentUserChatParticipation.role === ChatRole.ADMIN;
}
