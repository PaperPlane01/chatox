import {action} from "mobx";
import {BaseEntity} from "./EntityStoreV2";
import {AbstractEntityStore} from "./AbstractEntityStore";
import {Entities, GetEntityType} from "../entities-store";

type SoftDeletableEntity<EntityName extends Entities> = GetEntityType<EntityName> & {
    id: string,
    deleted: boolean
}

export abstract class SoftDeletableEntityStore<
    EntityName extends Entities,
    Entity extends SoftDeletableEntity<EntityName>,
    DenormalizedEntity extends BaseEntity,
    InsertOptions extends object = {},
    DeleteOptions extends object = {}
    >
    extends AbstractEntityStore<EntityName, Entity, DenormalizedEntity, InsertOptions> {

    @action.bound
    deleteAllById(ids: string[]): void {
        const entities = this.findAllById(ids);
        entities.forEach(entity => entity.deleted = true);
        this.insertAllEntities(entities);
    }

    @action.bound
    deleteById(id: string): void {
        const entity = this.findById(id);
        entity.deleted = true;
        this.insertEntity(entity);
    }
}