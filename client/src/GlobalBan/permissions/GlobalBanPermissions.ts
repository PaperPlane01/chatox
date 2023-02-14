import {makeAutoObservable} from "mobx";
import {AuthorizationStore} from "../../Authorization";

export class GlobalBanPermissions {
    get canBanUsersGlobally(): boolean {
        return this.authorization.currentUserIsAdmin;
    }

    constructor(private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);
    }
}