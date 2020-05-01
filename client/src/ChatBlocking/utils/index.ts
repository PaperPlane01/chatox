import {isBefore} from "date-fns";
import {ChatBlockingEntity} from "../types";

export const isChatBlockingActive = (chatBlocking: ChatBlockingEntity): boolean => {
    if (chatBlocking.canceled) {
        return false;
    }

    return isBefore(new Date(), chatBlocking.blockedUntil);
};
