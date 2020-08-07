import {action, observable, computed} from "mobx";
import {UserApi} from "../../api";
import {CurrentUser} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {tokenRefreshState} from "../../api/axios-instance";

export class AuthorizationStore {
    @observable
    currentUser?: CurrentUser = undefined;

    @observable
    fetchingCurrentUser: boolean = false;

    @observable
    loggingOut: boolean = false;

    @computed
    get refreshingToken(): boolean {
        return tokenRefreshState.refreshingToken;
    }

    constructor(private readonly entities: EntitiesStore) {}

    @action
    setCurrentUser = (currentUser: CurrentUser): void => {
        this.currentUser = currentUser;
        this.entities.users.insert({
            ...currentUser,
            deleted: false,
            online: true
        });
    };

    @action
    setTokens = (accessToken: string, refreshToken: string): void => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    };

    @action
    fetchCurrentUser = (): Promise<void> => {
        this.fetchingCurrentUser = true;

        return UserApi.getCurrentUser()
            .then(({data}) => {
                this.entities.insertUser({
                    ...data,
                    online: true,
                    deleted: false
                });
                this.currentUser = {
                    ...data,
                    avatarId: data.avatar ? data.avatar.id : undefined
                };
            })
            .finally(() => this.fetchingCurrentUser = false);
    };

    @action
    logOut = (): void =>  {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken) {
            this.loggingOut = true;
            UserApi.revokeToken({
                accessToken,
                refreshToken
            })
                .finally(() => {
                    this.currentUser = undefined;
                    this.loggingOut = false;
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                })

        } else {
            this.currentUser = undefined;
        }
    }
}
