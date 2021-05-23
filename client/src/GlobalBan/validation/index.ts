import {isBefore} from "date-fns";
import {GlobalBanReason} from "../../api/types/response";
import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateGlobalBanReason = (reason: GlobalBanReason): keyof Labels | undefined => {
    if (!reason) {
        return "global.ban.reason.must-be-specified";
    }

    return undefined;
};

export const validateGlobalBanComment = (comment: string | null | undefined, reason: GlobalBanReason): keyof Labels | undefined => {
    if (isStringEmpty(comment)) {
        if (reason === GlobalBanReason.OTHER) {
            return "global.ban.comment.must-be-specified-if-reason-is-other";
        }

        return undefined;
    }

    if (comment!.length > 1000) {
        return "global.ban.comment.too-long";
    }

    return undefined;
};

export const validateGlobalBanExpirationDate = (date: Date | null | undefined, permanent: boolean): keyof Labels | undefined => {
    if (!date) {
        if (!permanent) {
            return "global.ban.expires-at.must-be-specified-if-ban-is-not-permanent";
        }

        return undefined;
    }

    if (isBefore(date, new Date())) {
        return "global.ban.expires-at.must-be-in-future";
    }

    return undefined;
}
