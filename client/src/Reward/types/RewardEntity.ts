import {Currency, TimeUnit} from "../../api/types/response";

export interface RewardEntity {
    id: string,
    createdById: string,
    updatedById?: string,
    rewardedUserId?: string,
    currency: Currency,
    createdAt: Date,
    updatedAt?: Date,
    periodStart?: Date,
    periodEnd?: Date,
    minRewardValue: number,
    maxRewardValue: number,
    useIntegersOnly: boolean,
    recurringPeriodUnit?: TimeUnit,
    recurringPeriodValue?: number,
    name?: string,
    active: boolean
}
