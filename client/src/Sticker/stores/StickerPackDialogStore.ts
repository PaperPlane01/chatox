import {makeAutoObservable, runInAction} from "mobx";
import {getLoadErrorText} from "../utils";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {LocaleStore} from "../../localization";

export class StickerPackDialogStore {
    stickerPackId?: string = undefined;

    pending = false;

    get stickerPackDialogOpen(): boolean {
        return Boolean(this.stickerPackId);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    setStickerPackId(stickerPackId?: string): void {
        if (stickerPackId) {
            const stickerPack = this.entities.stickerPacks.findByIdOptional(stickerPackId);

            if (!stickerPack) {
                this.fetchStickerPack(stickerPackId);
            }
        }

        this.stickerPackId = stickerPackId;
    }

    fetchStickerPack(stickerPackId: string): void {
        this.pending = true;

        StickerApi.findStickerPackById(stickerPackId)
            .then(({data}) => this.entities.stickerPacks.insert(data))
            .catch(error => {
                const apiError = getInitialApiErrorFromResponse(error);
                this.snackbarService.error(getLoadErrorText(apiError, this.locale.getCurrentLanguageLabel));
            })
            .finally(() => runInAction(() => this.pending = false));
    }
}
