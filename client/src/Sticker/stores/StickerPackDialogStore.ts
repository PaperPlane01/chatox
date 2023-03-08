import {makeAutoObservable} from "mobx";

export class StickerPackDialogStore {
    stickerPackId?: string = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    get stickerPackDialogOpen(): boolean {
        return Boolean(this.stickerPackId);
    }

    setStickerPackId = (stickerPackId?: string): void => {
        this.stickerPackId = stickerPackId;
    };
}
