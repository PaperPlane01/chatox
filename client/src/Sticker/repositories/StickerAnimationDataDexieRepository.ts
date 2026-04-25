import {StickerAnimationDataRepository} from "./StickerAnimationDataRepository";
import {StickerAnimationData} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {createEmptyEntitiesPatch, EntitiesPatch} from "../../entities-store";
import {ChatoxDexieDatabase} from "../../repositories";

export class StickerAnimationDataDexieRepository extends AbstractDexieRepository<StickerAnimationData> implements StickerAnimationDataRepository {

	constructor(database: ChatoxDexieDatabase) {
		super(database.stickerAnimationData, database);
	}

	async loadRelationships(entity: StickerAnimationData): Promise<{}> {
		return {};
	}

	async loadRelationshipsForArray(entities: StickerAnimationData[]): Promise<{}> {
		return {};
	}

	async restoreEntityPatchForEntities(entities: StickerAnimationData[]): Promise<EntitiesPatch> {
		const entitiesPatch = createEmptyEntitiesPatch("stickerAnimationData");
		entities.forEach(entity => {
			entitiesPatch.ids.stickerAnimationData.push(entity.id);
			entitiesPatch.entities.stickerAnimationData[entity.id] = entity;
		});
		return entitiesPatch;
	}
}