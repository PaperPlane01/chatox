export interface EntityMap<Entity> {
    [id: string]: Entity
}

export interface EntityStore<Entity extends {id: string}, DenormalizedEntity extends {id: string}> {
    entities: EntityMap<Entity>,
    ids: string[],
    insert: (entity: DenormalizedEntity) => Entity,
    insertEntity: (entity: Entity) => Entity,
    insertAll: (entities: DenormalizedEntity[]) => void,
    insertAllEntities: (entities: Entity[]) => void,
    findById: (id: string) => Entity | undefined,
    deleteById: (id: string) => void,
    deleteAllById: (id: string[]) => void,
    findAllById: (ids: string[]) => Entity[],
    findAll: () => Entity[]
}
