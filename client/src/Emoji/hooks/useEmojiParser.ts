import {ReactNode} from "react";
import {Data} from "emoji-mart";
import allData from "emoji-mart/data/all.json";
import {EmojiParser} from "../internal/EmojiParser";
import {MessageEmoji} from "../../api/types/response";
import {useStore} from "../../store/hooks";

const emojiParser = new EmojiParser();

export type ParseEmojiFunction = (text: string, emojiData?: MessageEmoji) => ReactNode | ReactNode[];

interface UseEmojiParser {
    parseEmoji: ParseEmojiFunction
}

export const useEmojiParser = (): UseEmojiParser => {
    const {
        emoji: {
            selectedEmojiSet
        }
    } = useStore();

    const parseEmoji = (text: string, emojiData?: MessageEmoji): ReactNode | ReactNode[] => {
        console.log(text);

        return emojiParser.parseEmoji(text, {
            set: selectedEmojiSet,
            emojiData,
            emojiMartData: allData as any as Data
        });
    };

    return {parseEmoji};
}
