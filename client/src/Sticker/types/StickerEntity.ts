import {EmojiData} from "emoji-mart";

export interface StickerEntity {
    id: string,
    emojis: EmojiData[],
    keywords: string[],
    imageId: string,
    stickerPackId: string
}
