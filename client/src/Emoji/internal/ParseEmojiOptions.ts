import {Data} from "emoji-mart";
import {ExtendedEmojiSet} from "../types";
import {MessageEmoji} from "../../api/types/response";

export interface ParseEmojiOptions {
    set: ExtendedEmojiSet,
    emojiMartData: Data,
    emojiData?: MessageEmoji
}
