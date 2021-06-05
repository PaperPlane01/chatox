import {EmojiData} from "emoji-mart";

export interface CreateStickerFormData {
    emojis: EmojiData[],
    keywords: string[],
    imageId?: string
}
