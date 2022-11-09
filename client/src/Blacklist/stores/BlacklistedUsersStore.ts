import {action, observable, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ApiError, BlacklistApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStoreV2} from "../../entities-store";
import {User} from "../../api/types/response";

export class BlacklistedUsersStore {
    @observable
    usersIds: string[] = [];

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStoreV2) {
    }

    isUserBlacklisted = createTransformer((userId: string) => this.usersIds.includes(userId));

    @action
    fetchBlacklistedUsers = (): void => {
        this.pending = true;
        this.error = undefined;

        BlacklistApi.getBlacklistOfCurrentUser()
            .then(({data}) => this.setUsers(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    setUsers = (users: User[]): void => {
        this.entities.users.insertAll(users);
        this.usersIds = users.map(user => user.id);
    }
}