import {AbstractPouchRepository} from "../../repository";
import {Upload} from "../../api/types/response";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {UploadRepository} from "./UploadRepository";

export class UploadPouchRepository extends AbstractPouchRepository<Upload<any>> implements UploadRepository {

	async beforeInit() {
		await this.addIndex(["type"]);
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
}