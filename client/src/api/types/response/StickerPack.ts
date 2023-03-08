import {Upload} from "./Upload";
import {GifUploadMetadata} from "./GifUploadMetadata";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {Sticker} from "./Sticker";

export interface StickerPack {
    author?: string,
    createdAt: string,
    description: string,
    id: string,
    name: string,
    preview: Upload<GifUploadMetadata | ImageUploadMetadata>,
    stickers: Sticker[]
}
