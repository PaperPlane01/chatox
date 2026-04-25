import {Entities, GetEntityType, RelationshipsIds} from "../entities-store";

export interface BaseEntity {
    id: string
}

/**
 *
 */
export interface EntityStore<
    EntityName extends Entities,
    Entity extends GetEntityType<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    > {
    /**
     * IDs of all entities stored in this entity store
     */
    readonly ids: string[],

    /**
     * Returns sorted IDs of all entities stored in this entity store if it supports sorting.
     * Otherwise, returns the same result as <code>ids</code>.
     */
    readonly sortedIds: string[],

    /**
     * Inserts entity in its denormalized form, and returns the result in normalized form
     * @param entity Denormalized entity
     * @param options Insert options specific to entity store
     * @return Entity in normalized form.
     */
    insert: (entity: DenormalizedEntity, options?: InsertOptions) => Entity,

    /**
     * Inserts entity and returns it
     * @param entity Entity to be inserted
     * @param options Insert options specific to entity store
     * @return Inserted entity
     */
    insertEntity: (entity: Entity, options?: InsertOptions) => Entity,

    /**
     * Inserts multiple entities in their denormalized forms
     * @param entities Entities to be inserted
     * @param options Insert options specific to entity store
     */
    insertAll: (entities: DenormalizedEntity[], options?: InsertOptions) => void,

    /**
     * Inserts multiple entities in their normalized forms
     * @param entities Entities to be inserted
     * @param options Insert options specific to entity store
     */
    insertAllEntities: (entities: Entity[], options?: InsertOptions) => void,

    /**
     * Returns entity by its ID
     * @param id ID of entity
     */
    findById: (id: string) => Entity,

    /**
     * Returns entity by ID with its relationships.
     * Some stores may not fully support this method and return empty relationships ids.
     * However, if this method is implemented, the returned relationships IDs must also include
     * IDs relationships of its children.
     * @param id ID of entity
     * @return Tuple with entity and its relationships
     */
    findByIdWithRelationships: (id: string) => readonly [Entity, RelationshipsIds]

    /**
     * Returns entity by its id
     * @param id
     */
    findByIdAsync: (id: string) => Promise<Entity> | Entity,
    findByIdOptional: (id: string) => Entity | undefined,
    deleteById: (id: string, options?: DeleteOptions) => void,
    deleteAllById: (id: string[], options?: DeleteOptions) => void,
    deleteAll: () => void,
    findAllById: (ids: string[]) => Entity[],
    findAllByIdWithRelationships: (ids: string[]) => Array<readonly [Entity, RelationshipsIds]>
    findAllByIdAsync: (ids: string[]) => Promise<Entity[]> | Entity[]
    findAll: () => Entity[],
    findAllAsync: () => Promise<Entity[]> | Entity[]
}