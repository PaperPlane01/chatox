import {observable, action} from "mobx";
import {ExtendedEmojiSet} from "../types";
import {ALLOWED_EMOJI_SETS} from "../internal/constants";

export class EmojiSettingsStore {
    @observable
    selectedEmojiSet: ExtendedEmojiSet = "apple";

    constructor() {
        const emojiSet = localStorage.getItem("emojiSet");

        if (emojiSet && (ALLOWED_EMOJI_SETS as string[]).includes(emojiSet)) {
            this.setSelectedEmojiSet(emojiSet as ExtendedEmojiSet, true);
        } else {
            this.setSelectedEmojiSet("apple");
        }
    }

    @action
    setSelectedEmojiSet = (emojiSet: ExtendedEmojiSet, skipSettingToLocalstorage: boolean = false): void => {
        if (!skipSettingToLocalstorage) {
            localStorage.setItem("emojiSet", emojiSet);
        }
        this.selectedEmojiSet = emojiSet;
    }
}
