import {makeAutoObservable} from "mobx";

export class StickerEmojiPickerDialogStore {
    stickerEmojiPickerDialogOpen = false;

    constructor() {
       makeAutoObservable(this);
    }

    setStickerEmojiPickerDialogOpen = (stickerEmojiPickerDialogOpen: boolean): void => {
        this.stickerEmojiPickerDialogOpen = stickerEmojiPickerDialogOpen;
    };
}
