import {ChatOfCurrentUserEntity, ChatParticipationEntity} from "../types";

export const canUpdateChat = (chat: ChatOfCurrentUserEntity): boolean => {
    return chat.createdByCurrentUser;
};

export const canLeaveChat = (chat: ChatOfCurrentUserEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && !chat.createdByCurrentUser);
};
