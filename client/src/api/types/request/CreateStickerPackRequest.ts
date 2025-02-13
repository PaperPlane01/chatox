import {CreateStickerRequest} from "./CreateStickerRequest";
import {StickerType} from "../response";

export interface CreateStickerPackRequest {
    name: string,
    description: string,
    author?: string,
    stickers: CreateStickerRequest[],
    stickersType: StickerType
}
