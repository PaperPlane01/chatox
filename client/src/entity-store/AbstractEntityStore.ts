import {action, computed} from "mobx";
import {createTransformer} from "mobx-utils";
import {BaseEntity, EntityStoreV2} from "./EntityStoreV2";
import {
    Entities,
    EntitiesPatch,
    EntitiesStore,
    GetEntityType,
    PopulatedEntitiesPatch,
    RawEntitiesStore
} from "../entities-store";

export abstract class AbstractEntityStore<
    EntityName extends Entities,
    Entity extends GetEntityType<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    >
    implements EntityStoreV2<EntityName, Entity, DenormalizedEntity, InsertOptions, DeleteOptions> {

    @computed
    get ids(): string[] {
        return this.rawEntities.ids[this.entityName];
    }

    public constructor(protected readonly rawEntities: RawEntitiesStore,
                       protected readonly entityName: EntityName,
                       protected readonly entities: EntitiesStore) {
    }

    @action.bound
    deleteAll(): void {
        this.deleteAllById(this.ids);
    }

    @action.bound
    deleteAllById(ids: string[]): void {
        ids.forEach(id => this.rawEntities.deleteEntity(this.entityName, id));
    }

    @action.bound
    deleteById(id: string): void {
        this.rawEntities.deleteEntity(this.entityName, id);
    }

    findAll(): Entity[] {
        return this.findAllById(this.ids);
    }

    findAllById = createTransformer((ids: Iterable<string>): Entity[] => {
        const entities: Entity[] = [];
        for (const id of ids) {
            entities.push(this.findById(id));
        }
        return entities;
    });

    findById = createTransformer((id: string): Entity => {
        return this.findByIdOptional(id)!
    });

    findByIdOptional = createTransformer((id: string): Entity | undefined => {
        return this.rawEntities.entities[this.entityName][id] as Entity | undefined;
    });

    @action.bound
    insert(entity: DenormalizedEntity, options?: InsertOptions): Entity {
        this.rawEntities.applyPatch(this.createPatch(entity, options));
        return this.findById(entity.id);
    }

    @action.bound
    insertAll(entities: DenormalizedEntity[], options?: InsertOptions): void {
        this.rawEntities.applyPatch(this.createPatchForArray(entities, options));
    }

    @action.bound
    insertAllEntities(entities: Entity[]): void {
        const patch = this.createEmptyPatch();
        entities.forEach(entity => {
            patch.entities[this.entityName][entity.id] = entity;
            patch.ids[this.entityName].push(entity.id);
        });
        this.rawEntities.applyPatch(patch);
    }

    @action.bound
    insertEntity(entity: Entity): Entity {
        const patch = this.createEmptyPatch();
        patch.entities[this.entityName][entity.id] = entity;
        patch.ids[this.entityName].push(entity.id);
        this.rawEntities.applyPatch(patch);
        return entity;
    }

    protected createEmptyPatch() {
        return this.createEmptyEntitiesPatch(this.entityName as Entities);
    }

    protected createEmptyEntitiesPatch<T extends Entities>(...entities: T[]): PopulatedEntitiesPatch<T> {
        const patch = {
            entities: {},
            ids: {}
        };

        entities.forEach(entityType => {
            (patch.entities as any)[entityType] = {};
            (patch.ids as any)[entityType] = [];
        });

        return patch as unknown as PopulatedEntitiesPatch<T>;
    }

    public createPatch(denormalizedEntity: DenormalizedEntity, options?: InsertOptions): EntitiesPatch {
        return this.createPatchForArray([denormalizedEntity], options);
    }

    public abstract createPatchForArray(denormalizedEntities: DenormalizedEntity[], options?: InsertOptions): EntitiesPatch;

    protected abstract convertToNormalizedForm(denormalizedEntity: DenormalizedEntity): Entity;
}