import {makeAutoObservable, runInAction} from "mobx";
import {AuthorizationStore} from "./AuthorizationStore";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";

export class LoginWithGoogleStore {
    googleAccessToken?: string = undefined;

    pending: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly authorizationStore: AuthorizationStore) {
        makeAutoObservable(this);
    }

    getOriginalPath = () => localStorage.getItem("originalPath")

    setOriginalPath = (originalPath: string) => localStorage.setItem("originalPath", originalPath);

    getOriginalParams = (): any | undefined => {
        const originalParams = localStorage.getItem("originalParams");

        return originalParams ? JSON.parse(originalParams) : undefined;
    }

    setOriginalParams = (originalParams: any) => localStorage.setItem("originalParams", JSON.stringify(originalParams));

    getOriginalQueryParams = (): any | undefined => {
        const originalQueryParams = localStorage.getItem("originalQueryParams");

        return originalQueryParams ? JSON.parse(originalQueryParams) : undefined;
    }

    setOriginalQueryParams = (originalQueryParams: any) => localStorage.setItem("originalQueryParams", JSON.stringify(originalQueryParams));

    setGoogleAccessToken = (googleAccessToken: string): void => {
        this.googleAccessToken = googleAccessToken;
    };

    loginWithGoogle = (): void => {
        if (!this.googleAccessToken) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        UserApi.registerWithGoogle({
            googleAccessToken: this.googleAccessToken,
            clientId: `${process.env.REACT_APP_CLIENT_ID}`,
            clientSecret: `${process.env.REACT_APP_CLIENT_SECRET}`
        })
            .then(({data}) => {
                this.authorizationStore.setTokens(data.accessToken, data.refreshToken);

                if (window && window.location) {
                    window.location.reload();
                }
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };
}
