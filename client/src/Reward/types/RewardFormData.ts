import {Currency, TimeUnit} from "../../api/types/response";

export interface RewardFormData {
    currency: Currency,
    userId?: string,
    periodStart?: Date,
    periodEnd?: Date,
    minRewardValue: string,
    maxRewardValue: string,
    useIntegersOnly: boolean,
    recurringPeriodUnit?: TimeUnit,
    recurringPeriodValue: string,
    active: boolean,
    name: string
}

