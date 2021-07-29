import {StickerEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {Sticker} from "../../api/types/response";

export class StickersStore extends AbstractEntityStore<StickerEntity, Sticker> {
    protected convertToNormalizedForm(denormalizedEntity: Sticker): StickerEntity {
        return {
            id: denormalizedEntity.id,
            emojis: denormalizedEntity.emojis,
            imageId: denormalizedEntity.image.id,
            keywords: denormalizedEntity.keywords,
            stickerPackId: denormalizedEntity.stickerPackId
        }
    }
}
