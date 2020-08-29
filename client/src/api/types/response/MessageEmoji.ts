import {EmojiMap} from "./EmojiMap";
import {EmojiPosition} from "./EmojiPosition";

export interface MessageEmoji {
    emojiPositions: EmojiPosition[],
    emoji: EmojiMap
}
