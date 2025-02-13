import {EmojiData} from "emoji-mart";

export interface CreateStickerRequest {
    emojis: EmojiData[],
    keywords: string[],
    uploadId: string
}
