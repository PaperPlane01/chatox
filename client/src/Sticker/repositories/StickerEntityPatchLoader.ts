import {StickerRepository} from "./StickerRepository";
import {StickerRelationshipsLoader} from "./StickerRelationshipsLoader";
import {StickerEntity} from "../types";
import {EntityPatchLoader} from "../../repository";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";

export class StickerEntityPatchLoader implements EntityPatchLoader<StickerEntity> {
	constructor(private readonly repository: StickerRepository,
				private readonly relationshipsLoader: StickerRelationshipsLoader) {
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickers", "uploads");

		const sticker = await this.repository.findById(id);

		if (!sticker) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationships(sticker);

		populatePatch(patch, "stickers", [sticker]);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const stickers = await this.repository.findAllById(ids);
		return this.restoreEntityPatchForEntities(stickers);
	}

	async restoreEntityPatchForEntities(entities: StickerEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickers", "uploads");

		if (entities.length === 0) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationshipsForArray(entities);

		populatePatch(patch, "stickers", entities);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}
}