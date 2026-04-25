import {StickerRequest} from "./StickerRequest";

export interface CreateStickerRequest extends StickerRequest {
    uploadId: string
}
