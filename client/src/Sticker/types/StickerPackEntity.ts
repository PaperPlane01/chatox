import {StickerType} from "../../api/types/response";

export interface StickerPackEntity {
    id: string,
    author?: string,
    description: string,
    name: string,
    stickersIds: string[],
    previewId: string,
    createdById: string,
    stickersType: StickerType
}
