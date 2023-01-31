import { observable, action, makeObservable } from "mobx";
import {ExtendedEmojiSet} from "../types";
import {ALLOWED_EMOJI_SETS} from "../internal/constants";

export class EmojiSettingsStore {
    selectedEmojiSet: ExtendedEmojiSet = "apple";

    useEmojiCodes: boolean = false;

    constructor() {
        makeObservable(this, {
            selectedEmojiSet: observable,
            useEmojiCodes: observable,
            setSelectedEmojiSet: action,
            setUseEmojiCodes: action
        });

        const emojiSet = localStorage.getItem("emojiSet");

        if (emojiSet && (ALLOWED_EMOJI_SETS as string[]).includes(emojiSet)) {
            this.setSelectedEmojiSet(emojiSet as ExtendedEmojiSet, true);
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

    setSelectedEmojiSet = (emojiSet: ExtendedEmojiSet, skipSettingToLocalstorage: boolean = false): void => {
        if (!skipSettingToLocalstorage) {
            localStorage.setItem("emojiSet", emojiSet);
        }
        this.selectedEmojiSet = emojiSet;
    };

    setUseEmojiCodes = (useEmojiCodes: boolean, skippSettingToLocalStorage: boolean = false): void => {
        if (!skippSettingToLocalStorage) {
            localStorage.setItem("useEmojiCodes", `${useEmojiCodes}`);
        }
        this.useEmojiCodes = useEmojiCodes;
    };
}
