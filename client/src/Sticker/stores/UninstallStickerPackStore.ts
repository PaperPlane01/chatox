import {action, observable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class UninstallStickerPackStore {
    @observable
    pendingUninstallationsMap: {[stickerPackId: string]: boolean} = {};

    @observable
    showSnackbar = false;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
    }

    @action
    uninstallStickerPack = (stickerPackId: string): void => {
        this.pendingUninstallationsMap[stickerPackId] = true;

        StickerApi.uninstallStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.removeInstalledStickerPack(stickerPackId);
                this.setShowSnackbar(true);
            })
            .finally(() => runInAction(() => this.pendingUninstallationsMap[stickerPackId] = false));
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
