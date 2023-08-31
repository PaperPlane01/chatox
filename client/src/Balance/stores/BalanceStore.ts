import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, WalletApi} from "../../api";
import {AuthorizationStore} from "../../Authorization";
import {Currency} from "../../api/types/response";

export class BalanceStore {
    balances = observable.map<Currency, number>()

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);

        reaction(
            () => this.authorization.currentUser,
            currentUser => {
                if (currentUser) {
                    this.fetchBalance();
                }
            }
        );
    }

    fetchBalance = (): void => {
        this.balances = observable.map();
        this.pending = true;
        this.error = undefined;

        WalletApi.getBalance()
            .then(({data}) => runInAction(() => {
                data.forEach(balance => this.balances.set(balance.currency, balance.amount));
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    updateBalance = (currency: Currency, amount: number): void => {
        this.balances.set(currency, amount);
    }
}