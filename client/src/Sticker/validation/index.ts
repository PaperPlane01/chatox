import {EmojiData} from "emoji-mart";
import {Labels} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";

export const validateStickerPackName = (name: string | undefined): keyof Labels | undefined => {
    if (isStringEmpty(name)) {
        return "sticker.pack.name.required";
    }

    if (name!.length > 50) {
        return "sticker.pack.name.too-long";
    }

    return undefined;
}

export const validateStickerPackDescription = (description: string | undefined): keyof Labels | undefined => {
    if (isStringEmpty(description)) {
        return "sticker.pack.description.required";
    }

    if (description!.length > 150) {
        return "sticker.pack.description.too-long";
    }

    return undefined;
}

export const validateStickerKeyword = (keyword: string): keyof Labels | undefined => {
    if (keyword.length > 30) {
        return "sticker.keywords.too-long";
    }

    return undefined;
}

export const validateStickerKeywords = (keywords: string[]): keyof Labels | undefined => {
    if (keywords.length > 10) {
        return "sticker.keywords.too-many";
    }

    for (let keyword in keywords) {
        const error = validateStickerKeyword(keyword);

        if (error) {
            return error;
        }
    }

    return undefined;
}

export const validateStickerEmojis = (emojis: EmojiData[]): keyof Labels | undefined => {
    if (emojis.length > 5) {
        return "sticker.emojis.too-many";
    }

    return undefined;
}
