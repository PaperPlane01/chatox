import {makeAutoObservable, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, GlobalBanApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class CancelGlobalBanStore {
    pendingCancellationsMap: {
        [id: string]: boolean
    } = {};

    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    isGlobalBanCancellationPending = createTransformer((globalBanId: string) => {
        return Boolean(this.pendingCancellationsMap[globalBanId])
    });

    cancelGlobalBan = (id: string): void => {
        const globalBan = this.entities.globalBans.findById(id);
        this.pendingCancellationsMap[id] = true;

        GlobalBanApi.cancelBan(globalBan.bannedUserId, id)
            .then(({data}) => this.entities.globalBans.insert(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pendingCancellationsMap[id] = false));
    };
}
