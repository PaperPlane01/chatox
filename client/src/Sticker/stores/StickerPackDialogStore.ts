import {observable, action, computed} from "mobx";

export class StickerPackDialogStore {
    @observable
    stickerPackId?: string = undefined;

    @computed
    get stickerPackDialogOpen(): boolean {
        return Boolean(this.stickerPackId);
    }

    @action
    setStickerPackId = (stickerPackId?: string): void => {
        this.stickerPackId = stickerPackId;
    }
}
