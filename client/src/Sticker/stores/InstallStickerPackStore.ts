import {action, observable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class InstallStickerPackStore {
    @observable
    pendingInstallationsMap: {[stickerPackId: string]: boolean} = {};

    @observable
    showSnackbar = false;

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
    }

    @action
    installStickerPack = (stickerPackId: string): void => {
        this.pendingInstallationsMap[stickerPackId] = true;

        StickerApi.installStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.addInstalledStickerPack(stickerPackId);
                this.setShowSnackbar(true);
            })
            .finally(() => runInAction(() => this.pendingInstallationsMap[stickerPackId] = false));
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
