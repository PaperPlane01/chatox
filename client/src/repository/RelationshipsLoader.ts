import {Relationships} from "./Relationships";
import {BaseEntity} from "../entity-store";

export interface RelationshipsLoader<T extends BaseEntity, R extends Relationships> {
	loadRelationships(entity: T): Promise<R>,
	loadRelationshipsForArray(entities: T[]): Promise<R>
}
