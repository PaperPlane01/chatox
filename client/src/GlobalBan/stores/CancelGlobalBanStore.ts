import {action, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, GlobalBanApi} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class CancelGlobalBanStore {
    @observable
    pendingCancellationsMap: {
        [id: string]: boolean
    } = {};

    @observable
    error?: ApiError = undefined;

    constructor(private readonly entities: EntitiesStore) {
    }

    isGlobalBanCancellationPending = createTransformer((globalBanId: string) => {
        return Boolean(this.pendingCancellationsMap[globalBanId])
    });

    @action
    cancelGlobalBan = (id: string): void => {
        const globalBan = this.entities.globalBans.findById(id);
        this.pendingCancellationsMap[id] = true;

        GlobalBanApi.cancelBan(globalBan.bannedUserId, id)
            .then(({data}) => this.entities.insertGlobalBan(data))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pendingCancellationsMap[id] = false);
    }
}
