import {makeAutoObservable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class InstallStickerPackStore {
    pendingInstallationsMap: {[stickerPackId: string]: boolean} = {};

    showSnackbar = false;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
        makeAutoObservable(this);
    }

    installStickerPack = (stickerPackId: string): void => {
        this.pendingInstallationsMap[stickerPackId] = true;

        StickerApi.installStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.addInstalledStickerPack(stickerPackId);
                this.setShowSnackbar(true);
            })
            .finally(() => runInAction(() => this.pendingInstallationsMap[stickerPackId] = false));
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
