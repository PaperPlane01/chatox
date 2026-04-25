import {makeAutoObservable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {StickerAnimationDataStore} from "./StickerAnimationDataStore";
import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";

export class InstalledStickerPacksStore {
    installedStickerPacksIds: string[] = [];

    pending = false;

    error?: ApiError = undefined;

    constructor(private readonly authorizationStore: AuthorizationStore,
                private readonly entities: EntitiesStore,
                private readonly stickerAnimationData: StickerAnimationDataStore) {
        makeAutoObservable(this, {}, {autoBind: true});

        reaction(
            () => this.authorizationStore.currentUser,
            currentUser => {
                if (currentUser) {
                    this.fetchInstalledStickerPacks();
                }
            }
        );
    }

    isStickerPackInstalled = computedFn((stickerPackId: string) => this.installedStickerPacksIds.includes(stickerPackId));

    fetchInstalledStickerPacks(): void {
        this.pending = true;
        this.error = undefined;

        StickerApi.getInstalledStickerPacks()
            .then(({data}) => runInAction(() => {
                this.entities.stickerPacks.insertAll(data);
                this.installedStickerPacksIds = data.map(stickerPack => stickerPack.id);
                Promise.all(
                    data.map(({id}) => this.stickerAnimationData.loadAnimationDataForStickerPack(id))
                );
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    addInstalledStickerPack(stickerPackId: string): void {
        this.installedStickerPacksIds.push(stickerPackId);
        this.stickerAnimationData.loadAnimationDataForStickerPack(stickerPackId);
    }

    removeInstalledStickerPack(stickerPackId: string): void {
        this.installedStickerPacksIds = this.installedStickerPacksIds
            .filter(currentStickerPackId => currentStickerPackId !== stickerPackId);
        this.stickerAnimationData.deleteAnimationDataForStickerPack(stickerPackId);
    }
}
