import {makeAutoObservable, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ApiError, BlacklistApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {User} from "../../api/types/response";

export class BlacklistedUsersStore {
    usersIds: string[] = [];

    pending: boolean = false;

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);
    }

    isUserBlacklisted = createTransformer((userId: string) => this.usersIds.includes(userId));

    fetchBlacklistedUsers = (): void => {
        this.pending = true;
        this.error = undefined;

        BlacklistApi.getBlacklistOfCurrentUser()
            .then(({data}) => this.setUsers(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };

    setUsers = (users: User[]): void => {
        this.entities.users.insertAll(users);
        this.usersIds = users.map(user => user.id);
    };
}