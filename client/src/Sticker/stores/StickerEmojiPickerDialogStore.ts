import {action, observable} from "mobx";

export class StickerEmojiPickerDialogStore {
    @observable
    stickerEmojiPickerDialogOpen = false;

    @action
    setStickerEmojiPickerDialogOpen = (stickerEmojiPickerDialogOpen: boolean): void => {
        this.stickerEmojiPickerDialogOpen = stickerEmojiPickerDialogOpen;
    }
}
