import {EmojiData, EmojiSet} from "emoji-mart";

export interface EmojiMap {
    [emojiId: string]: EmojiData & {originalSet: EmojiSet}
}
