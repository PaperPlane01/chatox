import {AbstractDexieRepository} from "../../repository";
import {Upload} from "../../api/types/response";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {ChatoxDexieDatabase} from "../../repositories";
import {UploadRepository} from "./UploadRepository";

export class UploadDexieRepository extends AbstractDexieRepository<Upload<any>> implements UploadRepository {
	constructor(database: ChatoxDexieDatabase) {
		super(database.uploads, database);
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const uploads = await this.findAllById(ids);
		return await this.restoreEntityPatchForEntities(uploads);
	}

	async restoreEntityPatchForEntities(entities: Upload<any>[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("uploads");
		populatePatch(patch, "uploads", entities);
		return patch;
	}

	async loadRelationships(entity: Upload<any>): Promise<{}> {
		return {};
	}

	async loadRelationshipsForArray(entities: Upload<any>[]): Promise<{}> {
		return {};
	}
}