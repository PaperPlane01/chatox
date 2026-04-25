import {AbstractRelationshipsLoader, RelationshipsLoader} from "../../repository";
import {StickerEntity, StickerPackEntity, StickerPackRelationships} from "../types";
import {StickerPackRepository} from "./StickerPackRepository";
import {Repositories} from "../../repositories";
import {emptyArray} from "../../utils/array-utils";

export class StickerPackRelationshipsLoader extends AbstractRelationshipsLoader<StickerPackEntity, StickerPackRelationships> {
	constructor(private readonly repositories: Repositories) {
		super();
	}

	async loadRelationships(entity: StickerPackEntity): Promise<StickerPackRelationships> {
		const relationships = this.createEmptyRelationships();

		const stickerRepository = this.repositories.getRepository("stickers");

		if (!stickerRepository) {
			return relationships;
		}

		const stickers = await stickerRepository.findByStickerPack(entity.id);
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

		const stickers = await stickerRepository.findByStickerPackIdIn(stickerPackIds) ?? emptyArray<StickerEntity[]>();

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