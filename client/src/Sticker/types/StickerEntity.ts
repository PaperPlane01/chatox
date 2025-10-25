import {EmojiData} from "emoji-mart";
import {StickerType} from "../../api/types/response";

export interface StickerEntity {
    id: string,
    emojis: EmojiData[],
    keywords: string[],
    uploadId: string,
    stickerPackId: string,
    stickerType: StickerType
}
