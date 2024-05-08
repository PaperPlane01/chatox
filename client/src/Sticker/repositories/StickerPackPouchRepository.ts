import {StickerPackRepository} from "./StickerPackRepository";
import {StickerPackRelationshipsLoader} from "./StickerPackRelationshipsLoader";
import {StickerPackEntityPatchLoader} from "./StickerPackEntityPatchLoader";
import {StickerPackEntity, StickerPackRelationships} from "../types";
import {AbstractPouchRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {Repositories} from "../../repositories";

export class StickerPackPouchRepository
	extends AbstractPouchRepository<StickerPackEntity, StickerPackRelationships>
	implements StickerPackRepository {

	private readonly relationshipsLoader: StickerPackRelationshipsLoader;
	private readonly entityPatchLoader: StickerPackEntityPatchLoader;

	constructor(databaseName: string, repositories: Repositories) {
		super(databaseName, repositories);

		this.relationshipsLoader = new StickerPackRelationshipsLoader(repositories);
		this.entityPatchLoader = new StickerPackEntityPatchLoader(this, this.relationshipsLoader);
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}

	async restoreEntityPatchForEntities(entities: StickerPackEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async loadRelationships(entity: StickerPackEntity): Promise<StickerPackRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: StickerPackEntity[]): Promise<StickerPackRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}
}
