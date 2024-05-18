import {BaseEntity} from "./EntityStore";
import {AbstractEntityStore} from "./AbstractEntityStore";
import {Entities, EntitiesStore, GetEntityType, RawEntitiesStore} from "../entities-store";

type SoftDeletableEntity<EntityName extends Entities> = GetEntityType<EntityName> & {
    id: string,
    deleted: boolean
}

export interface EntityDeletionOptions {
    hardDelete?: boolean
}

export abstract class SoftDeletableEntityStore<
    EntityName extends Entities,
    Entity extends SoftDeletableEntity<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends EntityDeletionOptions = EntityDeletionOptions
    >
    extends AbstractEntityStore<EntityName, Entity, DenormalizedEntity, InsertOptions> {

    constructor(rawEntities: RawEntitiesStore, entityName: EntityName, entities: EntitiesStore) {
        super(rawEntities, entityName, entities);
    }

    deleteAllById(ids: string[], options?: EntityDeletionOptions): void {
        const hardDelete = options?.hardDelete ?? false;

        if (hardDelete) {
            ids.forEach(id => this.rawEntities.deleteEntity(this.entityName, id));
        } else {
            const entities = this.findAllById(ids);
            entities.forEach(entity => entity.deleted = true);
            this.insertAllEntities(entities);
        }
    }

    deleteById(id: string, options?: DeleteOptions): void {
        const hardDelete = options?.hardDelete ?? false;

        if (hardDelete) {
            this.rawEntities.deleteEntity(this.entityName, id);
        } else {
            const entity = this.findById(id);
            entity.deleted = true;
            this.insertEntity(entity);
        }
    }
}