import {StickerPackRelationshipsLoader} from "./StickerPackRelationshipsLoader";
import {StickerPackEntityPatchLoader} from "./StickerPackEntityPatchLoader";
import {StickerPackEntity, StickerPackRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {StickerPackRepository} from "./StickerPackRepository";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";
import {EntitiesPatch} from "../../entities-store";

export class StickerPackDexieRepository
	extends AbstractDexieRepository<StickerPackEntity, StickerPackRelationships>
	implements StickerPackRepository {

	private readonly relationshipsLoader: StickerPackRelationshipsLoader;
	private readonly entityPatchLoader: StickerPackEntityPatchLoader;

	constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
		super(database.stickerPacks, database);
		this.relationshipsLoader = new StickerPackRelationshipsLoader(repositories);
		this.entityPatchLoader = new StickerPackEntityPatchLoader(this, this.relationshipsLoader);
	}

	async loadRelationships(entity: StickerPackEntity): Promise<StickerPackRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: StickerPackEntity[]): Promise<StickerPackRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}

	async restoreEntityPatchForEntities(entities: StickerPackEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}
}
