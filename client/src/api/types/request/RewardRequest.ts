import {Currency, TimeUnit} from "../response";

export interface RewardRequest {
    currency: Currency,
    userId?: string,
    periodStart?: string,
    periodEnd?: string,
    minRewardValue: number,
    maxRewardValue: number,
    useIntegersOnly: boolean,
    recurringPeriodUnit?: TimeUnit,
    recurringPeriodValue?: number,
    active: boolean,
    name?: string
}
