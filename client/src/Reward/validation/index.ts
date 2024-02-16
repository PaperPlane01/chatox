import {isBefore, isAfter} from "date-fns";
import {Labels} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";
import {isDefined} from "../../utils/object-utils";
import {TimeUnit} from "../../api/types/response";

export const MAX_REWARD_VALUE = 1_000_000;
export const MAX_RECURRING_PERIOD_VALUE = 1000;

export const validateMinRewardValue = (minRewardValue: string, maxRewardValue: string): keyof Labels | undefined => {
    if (isStringEmpty(minRewardValue)) {
        return "common.validation.error.required";
    }

    const minRewardNumber = Number(minRewardValue);

    if (isNaN(minRewardNumber) || !Number.isInteger(minRewardNumber)) {
        return "common.validation.error.must-be-integer";
    }

    if (!(minRewardNumber > 0)) {
        return "common.validation.error.must-be-positive";
    }

    if (minRewardNumber > MAX_REWARD_VALUE) {
        return "common.validation.error.value-too-large";
    }

    if (isStringEmpty(maxRewardValue)) {
        return undefined;
    }

    const maxRewardNumber = Number(maxRewardValue);

    if (isNaN(maxRewardNumber)) {
        return undefined;
    }

    if (!(minRewardNumber <= maxRewardNumber)) {
        return "reward.min-reward-value.must-be-less-than-or-equal-to-max";
    }

    return undefined;
};

export const validateMaxRewardValue = (maxRewardValue: string, minRewardValue: string): keyof Labels | undefined => {
    if (isStringEmpty(maxRewardValue)) {
        return "common.validation.error.required";
    }

    const maxRewardNumber = Number(maxRewardValue);

    if (isNaN(maxRewardNumber) || !Number.isInteger(maxRewardNumber)) {
        return "common.validation.error.must-be-integer";
    }

    if (maxRewardNumber > MAX_REWARD_VALUE) {
        return "common.validation.error.value-too-large";
    }

    const minRewardNumber = Number(minRewardValue);

    if (isNaN(maxRewardNumber)) {
        return undefined;
    }

    if (!(maxRewardNumber >= minRewardNumber)) {
        return "reward.max-reward-value.must-be-greater-than-or-equal-to-min";
    }

    return undefined;
};

export const validatePeriodStart = (periodStart?: Date, periodEnd?: Date): keyof Labels | undefined => {
    if (!isDefined(periodStart) && !isDefined(periodEnd)) {
        return undefined;
    }

    if (!isDefined(periodStart) && isDefined(periodEnd)) {
        return "reward.period.start.must-be-specified";
    }

    if (isDefined(periodStart) && isDefined(periodEnd)) {
        if (!isBefore(periodStart!, periodEnd!)) {
            return "reward.period.start.must-be-before-end";
        }
    }

    return undefined;
};

export const validatePeriodEnd = (periodEnd?: Date, periodStart?: Date): keyof Labels | undefined => {
    if (!isDefined(periodEnd) && !isDefined(periodStart)) {
        return undefined;
    }

    if (!isDefined(periodStart) && isDefined(periodEnd)) {
        return "reward.period.end.must-be-specified";
    }

    if (isDefined(periodEnd) && isDefined(periodStart)) {
        if (!isAfter(periodEnd!, periodStart!)) {
            return "reward.period.end.must-be-after-than-start";
        }
    }

    return undefined;
};

export const validateRecurringPeriodValue = (
    recurringPeriodValue: string,
    recurringPeriodUnit?: TimeUnit
): keyof Labels | undefined => {
    if (isStringEmpty(recurringPeriodValue)) {
        if (isDefined(recurringPeriodUnit)) {
            return "reward.recurring-period.value.must-be-specified";
        } else {
            return undefined;
        }
    }

    const recurringPeriodNumber = Number(recurringPeriodValue);

    if (isNaN(recurringPeriodNumber) || !Number.isInteger(recurringPeriodNumber)) {
        return "common.validation.error.must-be-integer";
    }

    if (recurringPeriodNumber <= 0) {
        return "common.validation.error.must-be-positive";
    }

    if (recurringPeriodNumber > MAX_RECURRING_PERIOD_VALUE) {
        return "common.validation.error.value-too-large";
    }

    return undefined;
};

export const validateRecurringPeriodUnit = (
    recurringPeriodUnit: TimeUnit | null | undefined,
    recurringPeriodValue: string
): keyof Labels | undefined => {
    if (isDefined(recurringPeriodUnit)) {
        return undefined;
    } else if (!isStringEmpty(recurringPeriodValue)) {
        return "reward.recurring-period.unit.must-be-specified";
    } else {
        return undefined;
    }
};

export const validateSelectedUserIdOrSlug = (selectedUserIdOrSlug: string): keyof Labels | undefined => {
    if (isStringEmpty(selectedUserIdOrSlug)) {
        return "common.validation.error.required";
    }

    return undefined;
};
