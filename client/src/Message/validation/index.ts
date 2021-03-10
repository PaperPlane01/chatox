import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";
import {differenceInMinutes, differenceInMonths} from "date-fns";

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

export const validateMessageScheduledDate = (scheduledAt?: Date): keyof Labels | undefined => {
    if (!scheduledAt) {
        return undefined;
    }

    const now = new Date();

    if (differenceInMinutes(now, scheduledAt) < 5) {
        return "message.schedule-date.must-be-five-minutes-from-now";
    }

    if (differenceInMonths(now, scheduledAt) > 1) {
        return "message.schedule-date.must-be-no-more-than-month-from-now";
    }

    return undefined;
};
