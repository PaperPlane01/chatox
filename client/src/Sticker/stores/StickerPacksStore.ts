import {StickerPackEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {StickerPack} from "../../api/types/response";

export class StickerPacksStore extends AbstractEntityStore<StickerPackEntity, StickerPack> {
    protected convertToNormalizedForm(denormalizedEntity: StickerPack): StickerPackEntity {
        return {
            id: denormalizedEntity.id,
            author: denormalizedEntity.author,
            description: denormalizedEntity.description,
            name: denormalizedEntity.name,
            stickersIds: denormalizedEntity.stickers.map(sticker => sticker.id)
        }
    }
}
