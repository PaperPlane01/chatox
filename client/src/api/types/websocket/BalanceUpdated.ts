import {Currency} from "../response";

export interface BalanceUpdated {
    amount: number,
    currency: Currency
}
