import {EmojiMap} from "./EmojiMap";

export class EmojiResponse {
    emojiPositions: Array<{
        start: number,
        end: number,
        emojiId: string
    }>;

    emoji: EmojiMap;

    constructor(emojiResponse: EmojiResponse) {
        Object.assign(this, emojiResponse);
    }
}
