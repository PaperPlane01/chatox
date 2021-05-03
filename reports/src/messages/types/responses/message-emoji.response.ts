import {EmojiPositionResponse} from "./emoji-position.response";
import {EmojiMapResponse} from "./emoji-map.response";

export interface MessageEmojiResponse {
    emojiPositions: EmojiPositionResponse[],
    emoji: EmojiMapResponse
}
