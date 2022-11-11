import {action, computed, observable} from "mobx";
import {UserApi} from "../../api";
import {CurrentUser, UserRole} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {tokenRefreshState} from "../../api/axios-instance";
import {isGlobalBanActive} from "../../GlobalBan/utils";

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

    private entities: EntitiesStore;

    setEntities = (entities: EntitiesStore): void => {
        this.entities = entities;
    }

    @action
    setCurrentUser = (currentUser: CurrentUser): void => {
        if (currentUser.globalBan) {
            this.entities.globalBans.insert(currentUser.globalBan);
        }

        this.currentUser = {
            ...currentUser,
            avatarId: currentUser.avatar ? currentUser.avatar.id : undefined
        };
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

    @computed
    get currentUserIsAdmin(): boolean {
        if (!this.currentUser) {
            return false;
        }

        return this.currentUser.roles.includes(UserRole.ROLE_ADMIN);
    }

    isCurrentUserBannedGlobally = (): boolean => {
        if (!this.currentUser) {
            return false;
        }

        if (!this.currentUser.globalBan) {
            return false;
        }

        const globalBan = this.entities.globalBans.findById(this.currentUser.globalBan.id);

        return isGlobalBanActive(globalBan, this.currentUser);
    }
}
