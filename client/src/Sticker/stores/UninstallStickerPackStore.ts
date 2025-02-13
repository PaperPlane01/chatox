import {makeAutoObservable, runInAction} from "mobx";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerApi} from "../../api";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

export class UninstallStickerPackStore {
    pendingUninstallationsMap: {[stickerPackId: string]: boolean} = {};

    constructor(private readonly installedStickerPacksStore: InstalledStickerPacksStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    uninstallStickerPack = (stickerPackId: string): void => {
        this.pendingUninstallationsMap[stickerPackId] = true;

        StickerApi.uninstallStickerPack(stickerPackId)
            .then(() => {
                this.installedStickerPacksStore.removeInstalledStickerPack(stickerPackId);
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("sticker.pack.uninstall.success")
                );
            })
            .finally(() => runInAction(() => this.pendingUninstallationsMap[stickerPackId] = false));
    }
}
