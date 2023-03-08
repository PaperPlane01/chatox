import {CreateStickerRequest} from "./CreateStickerRequest";

export interface CreateStickerPackRequest {
    name: string,
    description: string,
    author?: string,
    stickers: CreateStickerRequest[]
}
