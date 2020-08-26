import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateConfirmationCode = (verificationCode: string): keyof Labels | undefined => {
    if (isStringEmpty(verificationCode)) {
        return "email.verification.code.empty";
    }

    return undefined;
};
