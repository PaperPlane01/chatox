import {EmojiMap, StickerType} from "../../api/types/response";

export interface StickerEntity {
    id: string,
    emojiIds: string[],
    emojis: EmojiMap,
    keywords: string[],
    uploadId: string,
    stickerPackId: string,
    stickerType: StickerType
}
