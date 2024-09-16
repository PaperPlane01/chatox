import {BaseEntity} from "../entity-store";
import {EntitiesPatch} from "../entities-store";

export interface EntityPatchLoader<T extends BaseEntity> {
	restoreEntityPatch(id: string): Promise<EntitiesPatch>,
	restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch>,
	restoreEntityPatchForEntities(entities: T[]): Promise<EntitiesPatch>
}