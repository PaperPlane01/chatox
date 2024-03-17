import {EmojiMap} from "./EmojiMap";
import {EmojiPosition} from "./EmojiPosition";

export class EmojiResponse {
    emojiPositions: EmojiPosition[];

    emoji: EmojiMap;

    constructor(emojiResponse: EmojiResponse) {
        Object.assign(this, emojiResponse);
    }
}
