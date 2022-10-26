import {computed} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";

export class GlobalBanPermissions {
    @computed
    get canBanUsersGlobally(): boolean {
        return this.authorization.currentUserIsAdmin;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
    }
}