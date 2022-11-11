import {mergeWith} from "lodash";
import {StickerPackEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {StickerPack} from "../../api/types/response";
import {EntitiesPatch} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";

export class StickerPacksStore extends AbstractEntityStore<"stickerPacks", StickerPackEntity, StickerPack> {
    protected convertToNormalizedForm(denormalizedEntity: StickerPack): StickerPackEntity {
        return {
            id: denormalizedEntity.id,
            author: denormalizedEntity.author,
            description: denormalizedEntity.description,
            name: denormalizedEntity.name,
            stickersIds: denormalizedEntity.stickers.map(sticker => sticker.id),
            previewId: denormalizedEntity.preview.id
        };
    }

    createPatchForArray(denormalizedEntities: StickerPack[], options: {} | undefined): EntitiesPatch {
        const patches: EntitiesPatch[] = [];
        const patch = this.createEmptyEntitiesPatch("stickerPacks");

        denormalizedEntities.forEach(stickerPack => {
            patch.entities.stickerPacks[stickerPack.id] = this.convertToNormalizedForm(stickerPack);
            patch.ids.stickerPacks.push(stickerPack.id);
            patches.push(this.entities.stickers.createPatchForArray(stickerPack.stickers));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}