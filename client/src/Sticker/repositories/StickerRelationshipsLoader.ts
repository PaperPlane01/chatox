import {StickerEntity, StickerRelationships} from "../types";
import {AbstractRelationshipsLoader} from "../../repository";
import {Repositories} from "../../repositories";
import {emptyArray} from "../../utils/array-utils";
import {Upload} from "../../api/types/response";

export class StickerRelationshipsLoader extends AbstractRelationshipsLoader<StickerEntity, StickerRelationships> {
	constructor(private readonly repositories: Repositories) {
		super();
	}

	async loadRelationships(entity: StickerEntity): Promise<StickerRelationships> {
		const relationships: StickerRelationships = this.createEmptyRelationships();

		const upload = await this.repositories.getRepository("uploads")?.findById(entity.imageId);

		if (upload) {
			relationships.uploads.push(upload);
		}

		return relationships;
	}

	async loadRelationshipsForArray(entities: StickerEntity[]): Promise<StickerRelationships> {
		const relationships: StickerRelationships = this.createEmptyRelationships();

		const uploadsIds = entities.map(sticker => sticker.imageId);
		const uploads = await this.repositories.getRepository("uploads")?.findAllById(uploadsIds) ?? emptyArray<Upload<any>>();
		relationships.uploads.push(...uploads);

		return relationships;
	}

	protected createEmptyRelationships(): StickerRelationships {
		return {
			uploads: []
		};
	}
}