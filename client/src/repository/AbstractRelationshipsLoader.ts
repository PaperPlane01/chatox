import {BaseEntity} from "../entity-store";
import {Relationships} from "./Relationships";
import {RelationshipsLoader} from "./RelationshipsLoader";

export abstract class AbstractRelationshipsLoader<T extends BaseEntity, R extends Relationships> implements RelationshipsLoader<T, R> {
	abstract loadRelationships(entity: T): Promise<R>;
	abstract loadRelationshipsForArray(entities: T[]): Promise<R>;
	protected abstract createEmptyRelationships(): R;
}