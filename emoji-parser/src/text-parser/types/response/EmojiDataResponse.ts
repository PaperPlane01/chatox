import {EmojiData} from "emoji-mart";
import {EmojiSet} from "../../../emoji/types";

export class EmojiDataResponse {
    id: string;
    name: string;
    colons: string;
    emoticons: string[];
    native: string;
    originalSet: EmojiSet;
    unified: string;

    constructor(emojiData: EmojiData, originalSet: EmojiSet) {
        this.id = emojiData.id;
        this.name = emojiData.name;
        this.colons = emojiData.shortcodes;
        this.emoticons = emojiData.emoticons;
        this.native = emojiData.native;
        this.originalSet = originalSet;
        this.unified = emojiData.unified;
    }
}
