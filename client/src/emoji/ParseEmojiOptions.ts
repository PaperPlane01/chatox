import {Data, EmojiSet} from "emoji-mart";
import {MessageEmoji} from "../api/types/response";

export interface ParseEmojiOptions {
    set: EmojiSet,
    emojiMartData: Data,
    emojiData?: MessageEmoji
}
