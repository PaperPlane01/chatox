import {EntityPatchLoader} from "../../repository";
import {StickerPackEntity} from "../types";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {StickerPackRepository} from "./StickerPackRepository";
import {StickerPackRelationshipsLoader} from "./StickerPackRelationshipsLoader";

export class StickerPackEntityPatchLoader implements EntityPatchLoader<StickerPackEntity> {
	constructor(private readonly repository: StickerPackRepository,
				private readonly relationshipsLoader: StickerPackRelationshipsLoader) {
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickerPacks", "stickers", "uploads");

		const stickerPack = await this.repository.findById(id);

		if (!stickerPack) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationships(stickerPack);

		populatePatch(patch, "stickerPacks", [stickerPack]);
		populatePatch(patch, "stickers", relationships.stickers);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const stickerPacks = await this.repository.findAllById(ids);
		return this.restoreEntityPatchForEntities(stickerPacks);
	}

	async restoreEntityPatchForEntities(entities: StickerPackEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickerPacks", "stickers", "uploads");

		if (entities.length === 0) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationshipsForArray(entities);

		populatePatch(patch, "stickerPacks", entities);
		populatePatch(patch, "stickers", relationships.stickers);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

}