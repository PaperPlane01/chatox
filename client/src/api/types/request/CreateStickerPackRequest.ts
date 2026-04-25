import {CreateStickerRequest} from "./CreateStickerRequest";
import {StickerPackRequest} from "./StickerPackRequest";
import {StickerType} from "../response";

export interface CreateStickerPackRequest extends StickerPackRequest<CreateStickerRequest> {
    stickersType: StickerType
}
