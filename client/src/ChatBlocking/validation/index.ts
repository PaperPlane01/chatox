import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateBlockedUntil = (blockedUntil?: Date): keyof Labels | undefined => {
    if (!blockedUntil) {
        return "chat.blocking.block-until.required";
    }

    return undefined;
};

export const validateBlockingDescription = (description?: string): keyof Labels | undefined=> {
    if (!isStringEmpty(description)) {
        return undefined;
    }

    if (description!.length > 2000) {
        return "chat.blocking.description.too-long";
    }

    return undefined;
};
