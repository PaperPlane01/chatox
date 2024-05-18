import {mergeWith} from "lodash";
import {StickerEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, RelationshipsIds} from "../../entities-store";
import {Sticker} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

export class StickersStore extends AbstractEntityStore<"stickers", StickerEntity, Sticker> {
    findByIdWithRelationships(id: string): readonly [StickerEntity, RelationshipsIds] {
        const sticker = this.findById(id);

        return [
            sticker,
            {
                uploads: [sticker.imageId]
            }
        ];
    }

    protected convertToNormalizedForm(denormalizedEntity: Sticker): StickerEntity {
        return {
            id: denormalizedEntity.id,
            emojis: denormalizedEntity.emojis,
            imageId: denormalizedEntity.image.id,
            keywords: denormalizedEntity.keywords,
            stickerPackId: denormalizedEntity.stickerPackId
        }
    }

    createPatchForArray(denormalizedEntities: Sticker[], options: {} | undefined = undefined): EntitiesPatch {
        const patches: EntitiesPatch[] = [];
        const patch = this.createEmptyEntitiesPatch("stickers", "uploads");

        denormalizedEntities.forEach(sticker => {
            const stickerEntity = this.convertToNormalizedForm(sticker);
            patch.entities.stickers[stickerEntity.id] = stickerEntity;
            patch.ids.stickers.push(stickerEntity.id);
            patches.push(this.entities.uploads.createPatch(sticker.image));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}