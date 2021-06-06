import {action, observable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class UninstallStickerPackStore {
    @observable
    pendingUninstallationsMap: {[stickerPackId: string]: boolean} = {};

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
    }

    @action
    uninstallStickerPack = (stickerPackId: string): void => {
        this.pendingUninstallationsMap[stickerPackId] = true;

        StickerApi.uninstallStickerPack(stickerPackId)
            .then(() => this.installedStickerPacksStore.removeInstalledStickerPack(stickerPackId))
            .finally(() => runInAction(() => this.pendingUninstallationsMap[stickerPackId] = false));
    }
}
