import {Table} from "dexie";
import {Relationships} from "./Relationships";
import {Repository} from "./Repository";
import {BaseEntity} from "../entity-store";
import {ChatoxDexieDatabase} from "../repositories";
import {EntitiesPatch} from "../entities-store";

export abstract class AbstractDexieRepository<T extends BaseEntity, R extends Relationships = {}> implements Repository<T, R> {
	protected constructor(protected table: Table<T>, protected database: ChatoxDexieDatabase) {
	}

	async bulkUpsert(entities: T[]): Promise<Array<T>> {
		await this.database.transaction("rw", this.table, async () => {
			await this.table.bulkPut(entities);
		});
		return entities;
	}

	async findAllById(ids: string[]): Promise<T[]> {
		return this.table.where("id").anyOf(ids).toArray();
	}

	async findById(id: string): Promise<T> {
		return (await this.table.get(id))!;
	}

	abstract loadRelationships(entity: T): Promise<R>;

	abstract loadRelationshipsForArray(entities: T[]): Promise<R>;

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.restoreEntityPatchForArray([id]);
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const entities = await this.findAllById(ids);
		return await this.restoreEntityPatchForEntities(entities);
	}

	public abstract restoreEntityPatchForEntities(entities: T[]): Promise<EntitiesPatch>;

	async upsert(entity: T): Promise<T> {
		await this.database.transaction("rw", this.table, async () => {
			await this.table.put(entity);
		});
		return entity;
	}
}
