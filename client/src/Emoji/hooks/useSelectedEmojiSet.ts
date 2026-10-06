import {EmojiSet} from "../types";
import {useStore} from "../../store/hooks";

export const useSelectedEmojiSet = (): EmojiSet => {
    const {
        emoji: {
            selectedEmojiSet
        }
    } = useStore();

    return selectedEmojiSet;
};
