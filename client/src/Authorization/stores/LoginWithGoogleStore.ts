import {makeAutoObservable} from "mobx";
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
                this.authorizationStore.setCurrentUser({
                    id: data.userId,
                    accountId: data.accountId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    roles: data.roles,
                    slug: data.slug,
                    createdAt: data.createdAt,
                    externalAvatarUri: data.externalAvatarUri
                });
                this.authorizationStore.setTokens(data.accessToken, data.refreshToken);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    };
}
