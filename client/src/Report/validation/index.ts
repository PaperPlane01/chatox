import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateReportDescription = (description?: string): keyof Labels | undefined => {
    if (isStringEmpty(description, false)) {
        return undefined;
    }

    if (description!.length > 500) {
        return "report.description.is-too-long";
    }

    return undefined;
};
