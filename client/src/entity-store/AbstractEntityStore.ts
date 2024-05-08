import {action, computed, makeObservable, observable} from "mobx";
import {computedFn} from "mobx-utils";
import {orderBy} from "lodash";
import {BaseEntity, EntityStore} from "./EntityStore";
import {
    EntitiesPatch,
    EntitiesStore,
    GetEntityType,
    PopulatedEntitiesPatch,
    RawEntitiesStore,
    RawEntityKey,
    RelationshipsIds
} from "../entities-store";
import {SortingDirection} from "../utils/types";

export abstract class AbstractEntityStore<
    EntityName extends RawEntityKey,
    Entity extends GetEntityType<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    >
    implements EntityStore<EntityName, Entity, DenormalizedEntity, InsertOptions, DeleteOptions> {

    get ids(): string[] {
        return this.rawEntities.ids[this.entityName];
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
                       protected readonly entityName: RawEntityKey,
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

    deleteAllById(ids: string[], options?: DeleteOptions): void {
        ids.forEach(id => this.rawEntities.deleteEntity(this.entityName, id));
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
        return this.rawEntities.entities[this.entityName][id] as Entity | undefined;
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
        entities.forEach(entity => {
            patch.entities[this.entityName][entity.id] = entity;
            patch.ids[this.entityName].push(entity.id);
        });
        this.rawEntities.applyPatch(patch);
    }

    insertEntity(entity: Entity): Entity {
        const patch = this.createEmptyPatch();
        patch.entities[this.entityName][entity.id] = entity;
        patch.ids[this.entityName].push(entity.id);
        this.rawEntities.applyPatch(patch);
        return entity;
    }

    protected setSortingDirection(sortingDirection: SortingDirection): void {
        this.sortingDirection = sortingDirection;
    }

    protected setSortBy(properties: Array<keyof Entity>): void {
        this.sortBy = properties;
    }

    protected createEmptyPatch(): PopulatedEntitiesPatch<RawEntityKey> {
        return this.createEmptyEntitiesPatch(this.entityName);
    }

    protected createEmptyEntitiesPatch<T extends RawEntityKey>(...entities: T[]): PopulatedEntitiesPatch<T> {
        const patch: EntitiesPatch = {
            entities: {},
            ids: {}
        };

        entities.forEach(entityType => {
            patch.entities[entityType] = {};
            patch.ids[entityType] = [];
        });

        return patch as unknown as PopulatedEntitiesPatch<T>;
    }

    protected isPatchPopulated<T extends RawEntityKey>(
        patch: EntitiesPatch,
        ...entities: T[]
    ): patch is PopulatedEntitiesPatch<T> {
        for (const entity of entities) {
            if (!patch.ids[entity] || !patch.entities[entity]) {
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