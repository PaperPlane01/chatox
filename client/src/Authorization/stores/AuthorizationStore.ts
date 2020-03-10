import {action, observable} from "mobx";
import {UserApi} from "../../api";
import {CurrentUser} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";

export class AuthorizationStore {
    @observable
    currentUser?: CurrentUser = undefined;

    @observable
    fetchingCurrentUser: boolean = false;

    @observable
    loggingOut: boolean = false;

    constructor(private readonly entities: EntitiesStore) {}

    @action
    setCurrentUser = (currentUser: CurrentUser): void => {
        this.currentUser = currentUser;
        this.entities.users.insert({
            ...currentUser,
            deleted: false
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
            .then(({data}) => this.setCurrentUser(data))
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
