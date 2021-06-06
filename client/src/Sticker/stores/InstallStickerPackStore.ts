import {action, observable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";

export class InstallStickerPackStore {
    @observable
    pendingInstallationsMap: {[stickerPackId: string]: boolean} = {};

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore) {
    }

    @action
    installStickerPack = (stickerPackId: string): void => {
        this.pendingInstallationsMap[stickerPackId] = true;

        StickerApi.installStickerPack(stickerPackId)
            .then(() => this.installedStickerPacksStore.addInstalledStickerPack(stickerPackId))
            .finally(() => runInAction(() => this.pendingInstallationsMap[stickerPackId] = false));
    }
}
