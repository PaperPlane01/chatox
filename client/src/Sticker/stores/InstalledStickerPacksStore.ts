import {observable, action, runInAction, reaction} from "mobx";
import {createTransformer} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";

export class InstalledStickerPacksStore {
    @observable
    installedStickerPacksIds: string[] = [];

    @observable
    pending = false;

    @observable
    error?: ApiError = undefined;

    constructor(private readonly authorizationStore: AuthorizationStore,
                private readonly entities: EntitiesStore) {
        reaction(
            () => this.authorizationStore.currentUser,
            currentUser => {
                if (currentUser) {
                    this.fetchInstalledStickerPacks();
                }
            }
        );
    }

    isStickerPackInstalled = createTransformer((stickerPackId: string) => this.installedStickerPacksIds.includes(stickerPackId));

    @action
    fetchInstalledStickerPacks = (): void => {
        this.pending = true;
        this.error = undefined;

        StickerApi.getInstalledStickerPacks()
            .then(({data}) => runInAction(() => {
                this.entities.insertStickerPacks(data);
                this.installedStickerPacksIds = data.map(stickerPack => stickerPack.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    addInstalledStickerPack = (stickerPackId: string): void => {
        this.installedStickerPacksIds.push(stickerPackId);
    }

    @action
    removeInstalledStickerPack = (stickerPackId: string): void => {
        this.installedStickerPacksIds = this.installedStickerPacksIds.filter(currentStickerPackId => currentStickerPackId !== stickerPackId);
    }
}