import {EmojiData} from "emoji-mart";
import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {GifUploadMetadata} from "./GifUploadMetadata";

export interface Sticker {
    id: string,
    stickerPackId: string,
    keywords: string[],
    emojis: EmojiData[],
    image: Upload<ImageUploadMetadata | GifUploadMetadata>
}
