import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateBio = (bio?: string): keyof Labels | undefined => {
    if (isStringEmpty(bio, false)) {
        return undefined;
    }

    if (bio!.length > 10000) {
        return "user.bio.too-long";
    }

    return undefined;
};
