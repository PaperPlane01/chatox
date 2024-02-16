import {Currency} from "./Currency";
import {TimeUnit} from "./TimeUnit";

export interface UserReward {
    id: string,
    currency: Currency,
    periodStart?: string,
    periodEnd?: string,
    recurringPeriodValue?: number,
    recurringPeriodUnit?: TimeUnit,
    lastClaim?: string
}
