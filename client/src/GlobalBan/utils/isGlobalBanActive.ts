import {GlobalBanEntity} from "../types";
import {isAfter} from "date-fns";
import {CurrentUser, UserRole} from "../../api/types/response";

export const isGlobalBanActive = (globalBan: GlobalBanEntity, currentUser?: CurrentUser): boolean => {
    if (currentUser && currentUser.roles.includes(UserRole.ROLE_ADMIN)) {
        return false;
    }

    return !globalBan.canceledAt && (globalBan.permanent || isAfter(globalBan.expiresAt!, new Date()));
}
