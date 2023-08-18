import {User} from "./User";
import {Currency} from "./Currency";
import {TimeUnit} from "./TimeUnit";

export interface Reward {
    id: string,
    createdBy: User,
    updatedBy?: User,
    rewardedUser?: User,
    currency: Currency,
    createdAt: string,
    updatedAt?: string,
    periodStart?: string,
    periodEnd?: string,
    minRewardValue: number,
    maxRewardValue: number,
    useIntegersOnly: boolean,
    recurringPeriodUnit?: TimeUnit,
    recurringPeriodValue?: number,
    name?: string,
    active: boolean
}
