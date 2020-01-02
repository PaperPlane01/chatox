import {observable, action, reaction} from "mobx";
import {UserApi, ApiError} from "../../api";
import {CurrentUser} from "../../api/types/response";

export class AuthorizationStore {
    @observable
    currentUser?: CurrentUser = undefined;

    @observable
    pending: boolean = false;

    @action
    setCurrentUser = (currentUser: CurrentUser): void => {
        this.currentUser = currentUser;
    };

    @action
    setTokens = (accessToken: string, refreshToken: string): void => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    };

    @action
    fetchCurrentUser = (): void => {
        this.pending = true;

        UserApi.getCurrentUser()
            .then(({data}) => this.currentUser = data)
            .finally(() => this.pending = false);
    }
}
