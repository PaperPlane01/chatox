import {UploadResponse} from "../../uploads/types/responses";
import {ImageUploadMetadata} from "../../uploads";

export interface StickerPack {
    id: string,
    stickers: Array<{
        id: string,
        image: UploadResponse<ImageUploadMetadata>
    }>
}