import {makeAutoObservable, runInAction} from "mobx";
import {BlacklistedUsersStore} from "./BlacklistedUsersStore";
import {ApiError, BlacklistApi, getInitialApiErrorFromResponse} from "../../api";

export class AddUserToBlacklistStore {
    pendingUsersMap: {
        [userId: string]: {
            pending: boolean,
            showSnackbar: boolean,
            error?: ApiError
        }
    } = {};

    constructor(private readonly blacklistedUsersStore: BlacklistedUsersStore) {
        makeAutoObservable(this);
    }

    setShowSnackbar = (userId: string, showSnackbar: boolean): void => {
        if (!this.pendingUsersMap[userId]) {
            return;
        }

        this.pendingUsersMap[userId].showSnackbar = showSnackbar;
    };

    addUserToBlacklist = (userId: string): void => {
        this.pendingUsersMap[userId] = {
            pending: true,
            showSnackbar: false,
            error: undefined
        };

        BlacklistApi.addUserToBlacklist(userId)
            .then(({data}) => this.blacklistedUsersStore.setUsers(data))
            .catch(error => runInAction(() => this.pendingUsersMap[userId].error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => {
                this.pendingUsersMap[userId].pending = false;
                this.pendingUsersMap[userId].showSnackbar = true;
            }));
    };
}