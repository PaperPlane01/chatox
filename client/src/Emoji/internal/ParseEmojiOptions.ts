import {Data, EmojiData} from "emoji-mart";
import {ExtendedEmojiSet} from "../types";
import {MessageEmoji} from "../../api/types/response";
import {Position} from "react-markdown/lib/ast-to-react";

export type EmojiKeyProviderFunction = (emoji: EmojiData, nodePosition?: Position) => string;

export interface ParseEmojiOptions {
    set: ExtendedEmojiSet,
    emojiMartData: Data,
    emojiData?: MessageEmoji,
    nodePosition?: Position,
    emojiKeyProvider?: EmojiKeyProviderFunction
}
