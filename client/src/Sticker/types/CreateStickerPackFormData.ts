import {StickerContainer} from "../stores/StickerContainer";

export interface CreateStickerPackFormData {
    name?: string,
    description?: string,
    stickers: {[localStickerId: string]: StickerContainer}
    author?: string
}
