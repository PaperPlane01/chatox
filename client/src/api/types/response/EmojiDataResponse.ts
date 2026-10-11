import {EmojiData} from "emoji-mart";

export interface EmojiDataResponse {
    id: string;
    name: string;
    colons: string;
    emoticons: string[];
    native: string;
    originalSet: string;
    unified: string;
}

export const toEmojiData = (emojiData: EmojiDataResponse): EmojiData => ({
    id: emojiData.id,
    name: emojiData.name,
    shortcodes: emojiData.colons,
    emoticons: emojiData.emoticons,
    keywords: [],
    unified: emojiData.unified,
    native: emojiData.native,
});

export const fromEmojiData = (emojiData: EmojiData): EmojiDataResponse => ({
    id: emojiData.id,
    name: emojiData.name,
    colons: emojiData.shortcodes,
    emoticons: emojiData.emoticons,
    native: emojiData.native,
    originalSet: "apple",
    unified: emojiData.unified,
});
