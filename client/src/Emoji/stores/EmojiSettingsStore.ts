import {makeAutoObservable} from "mobx";
import {EmojiSet} from "../types";
import {ALLOWED_EMOJI_SETS} from "../internal/constants";

export class EmojiSettingsStore {
    selectedEmojiSet: EmojiSet = "apple";

    useEmojiCodes: boolean = false;

    constructor() {
       makeAutoObservable(this, {}, {autoBind: true})

        const emojiSet = localStorage.getItem("emojiSet");

        if (emojiSet && (ALLOWED_EMOJI_SETS as string[]).includes(emojiSet)) {
            this.setSelectedEmojiSet(emojiSet as EmojiSet, true);
        } else {
            this.setSelectedEmojiSet("apple");
        }

        const useEmojiCodes = localStorage.getItem("useEmojiCodes");

        if (useEmojiCodes && `${useEmojiCodes}` === "true") {
            this.setUseEmojiCodes(true);
        } else {
            this.setUseEmojiCodes(false);
        }
    };

    setSelectedEmojiSet(emojiSet: EmojiSet, skipSettingToLocalstorage: boolean = false): void {
        if (!skipSettingToLocalstorage) {
            localStorage.setItem("emojiSet", emojiSet);
        }
        this.selectedEmojiSet = emojiSet;
    }

    setUseEmojiCodes(useEmojiCodes: boolean, skippSettingToLocalStorage: boolean = false): void {
        if (!skippSettingToLocalStorage) {
            localStorage.setItem("useEmojiCodes", `${useEmojiCodes}`);
        }
        this.useEmojiCodes = useEmojiCodes;
    }
}
