import {createContext, useContext, ReactNode} from "react";
import allData from "emoji-mart/data/all.json";
import {EmojiParser} from "../EmojiParser";
import {MessageEmoji} from "../../api/types/response";
import {Data} from "emoji-mart";

const emojiParser = new EmojiParser();

class EmojiParserContext {
    constructor() {
    }

    public parseEmoji(text: string, emojiData?: MessageEmoji): ReactNode | ReactNode[] {
        return emojiParser.parseEmoji(text, {
            emojiMartData: allData as any as Data,
            emojiData,
            set: "apple"
        })
    }
}

const emojiParserContext = createContext(new EmojiParserContext());

export const useEmojiParser = () => useContext(emojiParserContext);
