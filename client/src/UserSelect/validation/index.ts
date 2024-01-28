import {Labels} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";

export const validateSelectedUserIdOrSlug = (selectedUserIdOrSlug: string): keyof Labels | undefined => {
    if (isStringEmpty(selectedUserIdOrSlug)) {
        return "common.validation.error.required";
    }

    return undefined;
};
