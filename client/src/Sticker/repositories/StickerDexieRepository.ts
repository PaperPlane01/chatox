import {StickerRelationshipsLoader} from "./StickerRelationshipsLoader";
import {StickerEntityPatchLoader} from "./StickerEntityPatchLoader";
import {StickerRepository} from "./StickerRepository";
import {StickerEntity, StickerRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";
import {EntitiesPatch} from "../../entities-store";

export class StickerDexieRepository extends AbstractDexieRepository<StickerEntity, StickerRelationships> implements StickerRepository {
	private readonly relationshipsLoader: StickerRelationshipsLoader;
	private readonly entityPatchLoader: StickerEntityPatchLoader;

	constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
		super(database.stickers, database);
		this.relationshipsLoader = new StickerRelationshipsLoader(repositories);
		this.entityPatchLoader = new StickerEntityPatchLoader(this, this.relationshipsLoader);
	}

	async findByStickerPack(stickerPackId: string): Promise<Array<StickerEntity>> {
		return this.table.where("stickerPackId").equals(stickerPackId).toArray();
	}

	async findByStickerPackIdIn(stickerPacksIds: string[]): Promise<Array<StickerEntity>> {
		return this.table.where("stickerPackId").anyOf(stickerPacksIds).toArray();
	}

	async findByKeyword(keyword: string, stickerPacksIds: string[]): Promise<Array<StickerEntity>> {
		return this.table.where("keywords").equalsIgnoreCase(keyword)
			.and(sticker => stickerPacksIds.includes(sticker.stickerPackId))
			.toArray();
	}

	async findByEmojiId(emojiId: string, stickerPacksIds: string[]): Promise<Array<StickerEntity>> {
		return this.table.where("emojiIds").equals(emojiId)
			.and(sticker => stickerPacksIds.includes(sticker.stickerPackId))
			.toArray();
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
