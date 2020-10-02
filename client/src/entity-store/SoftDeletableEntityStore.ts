import {AbstractEntityStore} from "./AbstractEntityStore";
import {action} from "mobx";

interface SoftDeletableEntity {
    id: string,
    deleted: boolean
}

export abstract class SoftDeletableEntityStore<Entity extends SoftDeletableEntity, DenormalizedEntity extends {id: string}>
    extends AbstractEntityStore<Entity, DenormalizedEntity> {

    @action
    public deleteAllById(ids: string[]): void {
        ids.forEach(id => this.entities[id].deleted = true);
    };

    @action
    public deleteById(idToDelete: string): void {
        if (this.entities[idToDelete]) {
            this.entities[idToDelete].deleted = true;
        }
    };
}
