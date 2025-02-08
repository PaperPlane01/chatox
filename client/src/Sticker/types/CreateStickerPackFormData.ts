import {StickerContainer} from "../stores/StickerContainer";
import {StickerType} from "../../api/types/response";

export interface CreateStickerPackFormData {
    name?: string,
    description?: string,
    stickers: {[localStickerId: string]: StickerContainer}
    author?: string,
    stickersType?: StickerType
}
