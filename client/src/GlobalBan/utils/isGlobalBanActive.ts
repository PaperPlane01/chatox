import {GlobalBanEntity} from "../types";
import {isAfter} from "date-fns";

export const isGlobalBanActive = (globalBan: GlobalBanEntity): boolean => {
    return !globalBan.canceledAt && (globalBan.permanent || isAfter(globalBan.expiresAt!, new Date()));
}
