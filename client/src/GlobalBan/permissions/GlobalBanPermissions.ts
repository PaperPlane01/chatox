import {makeAutoObservable} from "mobx";
import type {AuthorizationStore} from "../../Authorization/stores";

export class GlobalBanPermissions {
    get canBanUsersGlobally(): boolean {
        return this.authorization.currentUserIsAdmin;
    }

    constructor(private readonly authorization: AuthorizationStore) {
        makeAutoObservable(this);
    }
}