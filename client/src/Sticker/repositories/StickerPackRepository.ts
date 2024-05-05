import {StickerEntity, StickerPackEntity} from "../types";
import {AbstractRepository, Relationships} from "../../repository";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {Upload} from "../../api/types/response";
import {emptyArray} from "../../utils/array-utils";

interface StickerPackRelationships extends Relationships {
	stickers: StickerEntity[],
	uploads: Upload<any>[]
}

export class StickerPackRepository extends AbstractRepository<StickerPackEntity, StickerPackRelationships> {
	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickerPacks", "stickers", "uploads");

		const stickerPack = await this.findById(id);

		if (!stickerPack) {
			return patch;
		}

		const relationships = await this.loadRelationships(stickerPack);

		populatePatch(patch, "stickerPacks", [stickerPack]);
		populatePatch(patch, "stickers", relationships.stickers);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForEntities(entities: StickerPackEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickerPacks", "stickers", "uploads");

		if (entities.length === 0) {
			return patch;
		}

		const relationships = await this.loadRelationshipsForArray(entities);

		populatePatch(patch, "stickerPacks", entities);
		populatePatch(patch, "stickers", relationships.stickers);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async loadRelationships(entity: StickerPackEntity): Promise<StickerPackRelationships> {
		const relationships = this.createEmptyRelationships();

		const stickerRepository = this.repositories.getRepository("stickers");

		if (!stickerRepository) {
			return relationships;
		}

		const stickers = await stickerRepository.find({
			stickerPackId: entity.id
		});
		relationships.stickers.push(...stickers);

		const stickerRelationships = await stickerRepository.loadRelationshipsForArray(stickers);

		relationships.uploads.push(...stickerRelationships.uploads);

		return relationships;
	}

	async loadRelationshipsForArray(entities: StickerPackEntity[]): Promise<StickerPackRelationships> {
		const relationships = this.createEmptyRelationships();

		const stickerRepository = this.repositories.getRepository("stickers");

		if (!stickerRepository) {
			return relationships;
		}

		const stickerPackIds = entities.map(stickerPack => stickerPack.id);

		const stickers = await stickerRepository.find({
			stickerPackId: stickerPackIds
		}) ?? emptyArray<StickerEntity[]>();

		const stickerRelationships = await stickerRepository.loadRelationshipsForArray(stickers);

		relationships.uploads.push(...stickerRelationships.uploads);

		return relationships;
	}

	protected createEmptyRelationships(): StickerPackRelationships {
		return {
			stickers: [],
			uploads: []
		};
	}
}
