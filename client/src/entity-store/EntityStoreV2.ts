import {Entities, GetEntityType} from "../entities-store";

export interface BaseEntity {
    id: string
}

export interface EntityStoreV2<
    EntityName extends Entities,
    Entity extends GetEntityType<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    > {
    readonly ids: string[],
    insert: (entity: DenormalizedEntity, options?: InsertOptions) => Entity,
    insertEntity: (entity: Entity, options?: InsertOptions) => Entity,
    insertAll: (entities: DenormalizedEntity[], options?: InsertOptions) => void,
    insertAllEntities: (entities: Entity[], options?: InsertOptions) => void,
    findById: (id: string) => Entity,
    findByIdOptional: (id: string) => Entity | undefined,
    deleteById: (id: string, options?: DeleteOptions) => void,
    deleteAllById: (id: string[], options?: DeleteOptions) => void,
    deleteAll: () => void,
    findAllById: (ids: string[]) => Entity[],
    findAll: () => Entity[]
}