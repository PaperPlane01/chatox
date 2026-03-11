import {makeAutoObservable} from "mobx";
import {ExpirableStore} from "../../expirable-store";
import {ConfirmationTokenResponse} from "../../api/types/response";

const CONFIRMATION_TOKEN_KEY = "confirmation_token";

export class ConfirmationTokenStore {
    private readonly storage = new ExpirableStore<string, ConfirmationTokenResponse>(
        ({expiresAt}) => new Date(expiresAt)
    );

    constructor() {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    setConfirmationToken(confirmationTokenResponse: ConfirmationTokenResponse): void {
        this.storage.set(CONFIRMATION_TOKEN_KEY, confirmationTokenResponse);
    }

    getConfirmationToken(): string | undefined {
        return this.storage.get(CONFIRMATION_TOKEN_KEY)?.confirmationToken;
    }
}
