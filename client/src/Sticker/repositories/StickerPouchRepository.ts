import {StickerRepository} from "./StickerRepository";
import {StickerRelationshipsLoader} from "./StickerRelationshipsLoader";
import {StickerEntityPatchLoader} from "./StickerEntityPatchLoader";
import {StickerEntity, StickerRelationships} from "../types";
import {AbstractPouchRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {Repositories} from "../../repositories";

export class StickerPouchRepository extends AbstractPouchRepository<StickerEntity, StickerRelationships> implements StickerRepository {
	private readonly relationshipsLoader: StickerRelationshipsLoader;
	private readonly entityPatchLoader: StickerEntityPatchLoader;

	constructor(databaseName: string, repositories: Repositories) {
		super(databaseName, repositories);
		this.relationshipsLoader = new StickerRelationshipsLoader(repositories);
		this.entityPatchLoader = new StickerEntityPatchLoader(this, this.relationshipsLoader);
	}

	async beforeInit() {
		await this.addIndex(["stickerPackId"]);
	}

	async findByStickerPack(stickerPackId: string): Promise<StickerEntity[]> {
		return this.find({stickerPackId});
	}

	async findByStickerPackIdIn(stickerPacksIds:string[]): Promise<StickerEntity[]> {
		return this.find({
			stickerPackId: {
				$in: stickerPacksIds
			}
		});
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}

	async restoreEntityPatchForEntities(entities: StickerEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async loadRelationships(entity: StickerEntity): Promise<StickerRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: StickerEntity[]): Promise<StickerRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}
}
