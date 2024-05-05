import {AbstractRepository, Relationships} from "../../repository";
import {StickerEntity} from "../types";
import {Upload} from "../../api/types/response";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {id} from "date-fns/locale";
import {emptyArray} from "../../utils/array-utils";

interface StickerRelationships extends Relationships {
	uploads: Upload<any>[]
}

export class StickerRepository extends AbstractRepository<StickerEntity, StickerRelationships> {
	async beforeInit() {
		await this.addIndex(["stickerPackId"]);
	}

	async findByStickerPack(stickerPackId: string): Promise<StickerEntity[]> {
		return this.find({stickerPackId});
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickers", "uploads");

		const sticker = await this.findById(id);

		if (!sticker) {
			return patch;
		}

		const relationships = await this.loadRelationships(sticker);

		populatePatch(patch, "stickers", [sticker]);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForEntities(entities:StickerEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("stickers", "uploads");

		if (entities.length === 0) {
			return patch;
		}

		const relationships = await this.loadRelationshipsForArray(entities);

		populatePatch(patch, "stickers", entities);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async loadRelationships(entity: StickerEntity): Promise<StickerRelationships> {
		const relationships: StickerRelationships = {
			uploads: []
		};

		const upload = await this.repositories.getRepository("uploads")?.findById(entity.imageId);

		if (upload) {
			relationships.uploads.push(upload);
		}

		return relationships;
	}

	async loadRelationshipsForArray(entities: StickerEntity[]): Promise<StickerRelationships> {
		const relationships: StickerRelationships = {
			uploads: []
		};

		const uploadsIds = entities.map(sticker => sticker.imageId);
		const uploads = await this.repositories.getRepository("uploads")?.findAllById(uploadsIds) ?? emptyArray<Upload<any>>();
		relationships.uploads.push(...uploads);

		return relationships;
	}
}
