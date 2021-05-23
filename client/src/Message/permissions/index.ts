import {differenceInDays, isBefore} from "date-fns";
import {MessageEntity} from "../types";
import {ChatOfCurrentUserEntity, ChatParticipationEntity} from "../../Chat";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {isDefined} from "../../utils/object-utils";
import {ChatRole} from "../../api/types/response";

export const canEditMessage = (
    message: MessageEntity,
    chatParticipation?: ChatParticipationEntity,
    activeChatBlocking?: ChatBlockingEntity
): boolean => {
    if (!chatParticipation) {
        return false;
    }

    if (message.deleted) {
        return false;
    }

    if (message.sender !== chatParticipation.userId) {
        return false;
    }

    if (differenceInDays(new Date(), message.createdAt) >= 1) {
        return false;
    }

    return  !(isDefined(activeChatBlocking) && isBefore(new Date(), activeChatBlocking!.blockedUntil));
};

export const canCreateMessage = (chatParticipation?: ChatParticipationEntity, activeChatBlocking?: ChatBlockingEntity, chat?: ChatOfCurrentUserEntity): boolean => {
    if (!chatParticipation) {
        return false;
    }

    if (isDefined(chat)) {
        if (chat!.deleted) {
            return false;
        }
    }

    return !(isDefined(activeChatBlocking) && isBefore(new Date(), activeChatBlocking!.blockedUntil))
};

export const canDeleteMessage = (message: MessageEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    if (!chatParticipation || message.deleted) {
        return false;
    }

    return chatParticipation.role === ChatRole.ADMIN || chatParticipation.role === ChatRole.MODERATOR
        || message.sender === chatParticipation.userId;
}

export const canPinMessage = (chat: ChatOfCurrentUserEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    if (!chatParticipation) {
        return false;
    }

    if (chat.pinnedMessageId) {
        return false;
    }

    return chatParticipation.role === ChatRole.ADMIN;
}

export const canUnpinMessage = (chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && chatParticipation.role === ChatRole.ADMIN);
}

export const canScheduleMessage = (chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && chatParticipation.role === ChatRole.ADMIN);
}

export const canDeleteScheduledMessage = (message: MessageEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && chatParticipation.role === ChatRole.ADMIN);
}

export const canUpdateScheduledMessage = (message: MessageEntity, chatParticipation?: ChatParticipationEntity): boolean => {
    return Boolean(chatParticipation && chatParticipation.role === ChatRole.ADMIN);
};
