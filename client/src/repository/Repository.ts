import {Relationships} from "./Relationships";
import {RelationshipsLoader} from "./RelationshipsLoader";
import {EntityPatchLoader} from "./EntityPatchLoader";
import {BaseEntity} from "../entity-store";

export interface Repository<T extends BaseEntity, R extends Relationships> extends RelationshipsLoader<T, R>, EntityPatchLoader<T> {
	findById(id: string): Promise<T>,
	findAllById(ids: string[]): Promise<T[]>
	upsert(entity: T): Promise<T>,
	bulkUpsert(entities: T[]): Promise<Array<T>>
}