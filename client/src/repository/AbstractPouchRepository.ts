import {IModel, PouchCollection} from "pouchorm";
import {v4 as uuid} from "uuid";
import {Repository} from "./Repository";
import {Relationships} from "./Relationships";
import {Repositories} from "../repositories";
import {EntitiesPatch} from "../entities-store";
import {BaseEntity} from "../entity-store";

interface PouchEntity extends IModel, BaseEntity {
}

export abstract class AbstractPouchRepository<T extends PouchEntity, R extends Relationships = {}>
	extends PouchCollection<T>
	implements Repository<T, R> {
	constructor(dbName: string, protected readonly repositories: Repositories) {
		super(dbName, {auto_compaction: true});
	}

	idGenerator = (item?: T) => item?.id ?? uuid()

	public async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.restoreEntityPatchForArray([id]);
	}

	public async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const entities = await this.findAllById(ids);
		return await this.restoreEntityPatchForEntities(entities);
	}

	public abstract restoreEntityPatchForEntities(entities: T[]): Promise<EntitiesPatch>;

	public async findAllById(ids: string[]): Promise<T[]> {
		if (ids.length === 0) {
			return [];
		}

		return this.find({_id: {$in: ids}});
	}

	public async loadRelationships(entity: T): Promise<R> {
		return this.loadRelationshipsForArray([entity]);
	}

	public async loadRelationshipsForArray(entities: T[]): Promise<R> {
		return {} as R;
	}

	protected createEmptyRelationships(): R {
		return {} as R;
	}
}
