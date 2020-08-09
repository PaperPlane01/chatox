import {isBefore, differenceInDays} from "date-fns";
import {MessageEntity} from "../types";
import {ChatParticipationEntity} from "../../Chat";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {isDefined} from "../../utils/object-utils";

export const canEditMessage = (message: MessageEntity, chatParticipation?: ChatParticipationEntity, activeChatBlocking?: ChatBlockingEntity): boolean => {
    if (!chatParticipation) {
        return false;
    }

    if (message.sender !== chatParticipation.userId) {
        return false;
    }

    if (differenceInDays(message.createdAt, new Date()) >= 1) {
        return false;
    }

    return  !(isDefined(activeChatBlocking) && isBefore(new Date(), activeChatBlocking!.blockedUntil));
};

export const canCreateMessage = (chatParticipation?: ChatParticipationEntity, activeChatBlocking?: ChatBlockingEntity): boolean => {
    if (!chatParticipation) {
        return false;
    }

    return !(isDefined(activeChatBlocking) && isBefore(new Date(), activeChatBlocking!.blockedUntil))
};
