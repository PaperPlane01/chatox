import {Data} from "emoji-mart";
import {ExtendedEmojiSet} from "../types";
import {MessageEmoji} from "../../api/types/response";
import {Position} from "react-markdown/lib/ast-to-react";

export interface ParseEmojiOptions {
    set: ExtendedEmojiSet,
    emojiMartData: Data,
    emojiData?: MessageEmoji,
    nodePosition?: Position
}
