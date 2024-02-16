import {Labels} from "../../localization";
import {isDefined} from "../../utils/object-utils";

export const MAX_USE_TIMES_MAX_VALUE = 1_000_000_000;

export const validateInviteName = (name?: string): keyof Labels | undefined => {
    if (!isDefined(name) || name.length === 0) {
        return undefined;
    }

    if (name.length > 50) {
        return "common.validation.error.value-too-large";
    }

    return undefined;
};

export const validateMaxUseTimes = (maxUseTimes?: string): keyof Labels | undefined => {
    if (!isDefined(maxUseTimes)) {
        return undefined;
    }

    const maxUseTimesNumber = Number(maxUseTimes);

    if (isNaN(maxUseTimesNumber) || !Number.isInteger(maxUseTimesNumber)) {
        return "common.validation.error.must-be-integer";
    }

    if (maxUseTimesNumber < 1) {
        return "common.validation.error.must-be-positive";
    }

    if (maxUseTimesNumber > MAX_USE_TIMES_MAX_VALUE) {
        return "common.validation.error.value-too-large";
    }

    return undefined;
};
