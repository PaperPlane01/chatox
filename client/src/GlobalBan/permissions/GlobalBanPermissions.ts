import {computed} from "mobx";
import {AuthorizationStore} from "../../Authorization";

export class GlobalBanPermissions {
    @computed
    get canBanUsersGlobally(): boolean {
        return this.authorization.currentUserIsAdmin;
    }

    constructor(private readonly authorization: AuthorizationStore) {
    }
}