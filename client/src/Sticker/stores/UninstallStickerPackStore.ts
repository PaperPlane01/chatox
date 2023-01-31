import {makeAutoObservable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class UninstallStickerPackStore {
    pendingUninstallationsMap: {[stickerPackId: string]: boolean} = {};

    showSnackbar = false;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
        makeAutoObservable(this);
    }

    uninstallStickerPack = (stickerPackId: string): void => {
        this.pendingUninstallationsMap[stickerPackId] = true;

        StickerApi.uninstallStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.removeInstalledStickerPack(stickerPackId);
                this.setShowSnackbar(true);
            })
            .finally(() => runInAction(() => this.pendingUninstallationsMap[stickerPackId] = false));
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
