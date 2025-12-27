import {StickerPackFormData} from "./StickerPackFormData";
import {StickerType} from "../../api/types/response";

export interface CreateStickerPackFormData extends StickerPackFormData {
    stickersType?: StickerType
}
