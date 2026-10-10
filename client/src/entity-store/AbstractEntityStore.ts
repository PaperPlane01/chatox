import {action, computed, makeObservable, observable} from "mobx";
import {computedFn} from "mobx-utils";
import {orderBy} from "lodash-es";
import {BaseEntity, EntityStore} from "./EntityStore";
import {
    Entities,
    EntitiesPatch,
    EntitiesStore,
    GetEntityType,
    PopulatedEntitiesPatch,
    RawEntitiesStore,
    RelationshipsIds
} from "../entities-store";
import {SortingDirection} from "../utils/types";

export abstract class AbstractEntityStore<
    EntityName extends Entities,
    Entity extends GetEntityType<EntityName> & BaseEntity,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    >
    implements EntityStore<EntityName, Entity, DenormalizedEntity, InsertOptions, DeleteOptions> {

    get ids(): string[] {
        return this.rawEntities.entities[this.entityName].keys().toArray();
    }

    get sortedIds(): string[] {
        if (this.sortBy.length === 0) {
            return this.ids;
        } else {
            const entities = this.ids.map(id => this.findById(id));

            return orderBy(entities, this.sortBy, this.sortingDirection).map(entity => entity.id);
        }
    }

    protected sortBy: Array<keyof Entity> = [];
    protected sortingDirection: SortingDirection = "desc";

    public constructor(protected readonly rawEntities: RawEntitiesStore,
                       protected readonly entityName: EntityName,
                       protected readonly entities: EntitiesStore) {
        makeObservable<AbstractEntityStore<EntityName, Entity, DenormalizedEntity, InsertOptions, DeleteOptions>, "sortingDirection" | "setSortingDirection" | "sortBy" | "setSortBy">(this, {
            ids: computed,
            sortedIds: computed,
            sortBy: observable,
            sortingDirection: observable,
            deleteAll: action.bound,
            deleteAllById: action.bound,
            deleteById: action.bound,
            insert: action.bound,
            insertAll: action.bound,
            insertAllEntities: action.bound,
            insertEntity: action.bound,
            setSortingDirection: action.bound,
            setSortBy: action.bound
        });
    }

    deleteAll(options?: DeleteOptions): void {
        this.deleteAllById(this.ids, options);
    }

    deleteAllById(ids: Iterable<string>, options?: DeleteOptions): void {
        for (const id in ids) {
            this.rawEntities.deleteEntity(this.entityName, id);
        }
    }

    deleteById(id: string, options?: DeleteOptions): void {
        this.rawEntities.deleteEntity(this.entityName, id);
    }

    findAll(): Entity[] {
        return this.findAllById(this.ids);
    }

    findAllAsync(): Promise<Entity[]> | Entity[] {
        return this.findAll();
    }

    findAllById = computedFn((ids: Iterable<string>): Entity[] => {
        const entities: Entity[] = [];
        for (const id of ids) {
            entities.push(this.findById(id));
        }

        if (this.sortBy.length === 0) {
            return entities;
        } else {
            return orderBy(entities, this.sortBy, this.sortingDirection);
        }
    })

    findAllByIdWithRelationships(ids: string[]): Array<readonly [Entity, RelationshipsIds]> {
        return ids.map(id => this.findByIdWithRelationships(id));
    }

    findAllByIdAsync(ids: string[]): Promise<Entity[]> | Entity[] {
        return this.findAllById(ids);
    }

    findById = computedFn((id: string): Entity => {
        return this.findByIdOptional(id)!
    })

    findByIdWithRelationships(id: string): readonly [Entity, RelationshipsIds] {
        return [this.findById(id), {}];
    }
 
    findByIdAsync(id: string): Promise<Entity> | Entity {
        return this.findById(id);
    }

    findByIdOptional = computedFn((id: string): Entity | undefined => {
        return this.rawEntities.entities[this.entityName].get(id) as Entity | undefined;
    })

    insert(entity: DenormalizedEntity, options?: InsertOptions): Entity {
        this.rawEntities.applyPatch(this.createPatch(entity, options));
        return this.findById(entity.id);
    }

    insertAll(entities: DenormalizedEntity[], options?: InsertOptions): void {
        this.rawEntities.applyPatch(this.createPatchForArray(entities, options));
    }

    insertAllEntities(entities: Entity[]): void {
        const patch = this.createEmptyPatch();
        entities.forEach((entity => patch.entities[this.entityName]?.set(entity.id, entity as any)));
        this.rawEntities.applyPatch(patch);
    }

    insertEntity(entity: Entity): Entity {
        const patch = this.createEmptyPatch();
        patch.entities[this.entityName]?.set(entity.id, entity as any);
        this.rawEntities.applyPatch(patch);
        return entity;
    }

    protected setSortingDirection(sortingDirection: SortingDirection): void {
        this.sortingDirection = sortingDirection;
    }

    protected setSortBy(properties: Array<keyof Entity>): void {
        this.sortBy = properties;
    }

    protected createEmptyPatch(): PopulatedEntitiesPatch<EntityName> {
        return this.createEmptyEntitiesPatch(this.entityName);
    }

    protected createEmptyEntitiesPatch<T extends Entities>(...entities: T[]): PopulatedEntitiesPatch<T> {
        const patch: EntitiesPatch = {
            entities: {},
        };

        entities.forEach(entityType => patch.entities[entityType] = new Map());

        return patch as unknown as PopulatedEntitiesPatch<T>;
    }

    protected isPatchPopulated<T extends Entities>(
        patch: EntitiesPatch,
        ...entities: T[]
    ): patch is PopulatedEntitiesPatch<T> {
        for (const entity of entities) {
            if (!patch.entities[entity]) {
                return false;
            }
        }

        return true;
    }

    public createPatch(denormalizedEntity: DenormalizedEntity, options?: InsertOptions): EntitiesPatch {
        return this.createPatchForArray([denormalizedEntity], options);
    }

    public abstract createPatchForArray(denormalizedEntities: DenormalizedEntity[], options?: InsertOptions): EntitiesPatch;

    protected abstract convertToNormalizedForm(denormalizedEntity: DenormalizedEntity): Entity;
}