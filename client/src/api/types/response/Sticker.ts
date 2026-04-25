import {EmojiData} from "emoji-mart";
import {Upload} from "./Upload";
import {StickerUploadMetadata} from "./StickerUploadMetadata";

export interface Sticker {
    id: string,
    stickerPackId: string,
    keywords: string[],
    emojis: EmojiData[],
    upload: Upload<StickerUploadMetadata>
}
