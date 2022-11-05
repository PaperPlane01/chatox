import {action} from "mobx";
import {BaseEntity} from "./EntityStoreV2";
import {AbstractEntityStoreV2} from "./AbstractEntityStoreV2";
import {Entities, GetEntityType} from "../entities-store";

type SoftDeletableEntity<EntityName extends Entities> = GetEntityType<EntityName> & {
    id: string,
    deleted: boolean
}

export abstract class SoftDeletableEntityStoreV2<EntityName extends Entities, Entity extends SoftDeletableEntity<EntityName>, DenormalizedEntity extends BaseEntity, InsertOptions extends object = {}>
    extends AbstractEntityStoreV2<EntityName, Entity, DenormalizedEntity, InsertOptions> {

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