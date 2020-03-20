import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

interface TextValidationOptions {
    acceptEmpty: boolean
}

export const validateMessageText = (
    text?: string,
    validationOptions: TextValidationOptions = {acceptEmpty: false}
): keyof Labels | undefined => {
    if (isStringEmpty(text)) {
        if (!validationOptions.acceptEmpty) {
            return "message.text-must-be-present";
        }
    }

    if (text!.length > 20000) {
        return "message.text-is-too-long";
    }

    return undefined;
};
