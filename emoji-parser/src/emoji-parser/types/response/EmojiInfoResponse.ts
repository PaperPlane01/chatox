import {EmojiData, EmojiSet} from "emoji-mart";

export class EmojiInfoResponse {
    positions: Array<{start: number, end: number}>;
    emojiData: EmojiData;
    originalSet: EmojiSet;

    constructor(emojiInfoResponse: EmojiInfoResponse) {
        Object.assign(this, emojiInfoResponse);
    }
}
