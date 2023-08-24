import {Currency, TimeUnit} from "../../api/types/response";

export interface UserRewardEntity {
    id: string,
    currency: Currency,
    periodStart?: Date,
    periodEnd?: Date,
    recurringPeriodValue?: number,
    recurringPeriodUnit?: TimeUnit,
    lastClaim?: Date
}