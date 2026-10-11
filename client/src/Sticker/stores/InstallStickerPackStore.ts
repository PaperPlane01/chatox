import {makeAutoObservable, runInAction} from "mobx";
import type {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";
import type {LocaleStore} from "../../localization";
import type {SnackbarService} from "../../Snackbar/services";

export class InstallStickerPackStore {
    pendingInstallationsMap: {[stickerPackId: string]: boolean} = {};

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    installStickerPack = (stickerPackId: string): void => {
        this.pendingInstallationsMap[stickerPackId] = true;

        StickerApi.installStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.addInstalledStickerPack(stickerPackId);
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("sticker.pack.install.success")
                );
            })
            .finally(() => runInAction(() => this.pendingInstallationsMap[stickerPackId] = false));
    }
}
