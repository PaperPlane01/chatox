import {Currency} from "./Currency";

export interface RewardClaim {
    id: string,
    createdAt: string,
    claimedAmount: number,
    currency: Currency
}
