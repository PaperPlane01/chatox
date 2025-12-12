import {mergeWith} from "lodash";
import {StickerEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, RelationshipsIds} from "../../entities-store";
import {EmojiMap, Sticker, StickerType} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";

export class StickersStore extends AbstractEntityStore<"stickers", StickerEntity, Sticker> {
    findByIdWithRelationships(id: string): readonly [StickerEntity, RelationshipsIds] {
        const sticker = this.findById(id);

        return [
            sticker,
            {
                uploads: [sticker.uploadId]
            }
        ];
    }

    protected convertToNormalizedForm(denormalizedEntity: Sticker): StickerEntity {
        const emojiIds: string[] = [];
        const emojis: EmojiMap = {};

        denormalizedEntity.emojis.forEach(emoji => {
            if (isDefined(emoji.id)) {
                emojiIds.push(emoji.id);
                emojis[emoji.id] = emoji;
            }
        });

        return {
            id: denormalizedEntity.id,
            emojiIds,
            emojis,
            uploadId: denormalizedEntity.upload.id,
            keywords: denormalizedEntity.keywords,
            stickerPackId: denormalizedEntity.stickerPackId,
            stickerType: denormalizedEntity.upload.type as StickerType
        }
    }

    createPatchForArray(denormalizedEntities: Sticker[], options: {} | undefined = undefined): EntitiesPatch {
        const patches: EntitiesPatch[] = [];
        const patch = this.createEmptyEntitiesPatch("stickers", "uploads");

        denormalizedEntities.forEach(sticker => {
            const stickerEntity = this.convertToNormalizedForm(sticker);
            patch.entities.stickers[stickerEntity.id] = stickerEntity;
            patch.ids.stickers.push(stickerEntity.id);
            patches.push(this.entities.uploads.createPatch(sticker.upload));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}