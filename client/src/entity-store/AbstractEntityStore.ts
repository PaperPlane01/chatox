import {action, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntityMap, EntityStore} from "./EntityStore";

export abstract class AbstractEntityStore<Entity extends {id: string}, DenormalizedEntity extends {id: string}>
    implements EntityStore<Entity, DenormalizedEntity> {
    @observable
    ids: string[] = [];

    @observable
    entities: EntityMap<Entity> = {};

    constructor() {
        this.deleteAllById = this.deleteAllById.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.insert = this.insert.bind(this);
        this.insertAll = this.insertAll.bind(this);
        this.insertEntity = this.insertEntity.bind(this);
        this.insertAllEntities = this.insertAllEntities.bind(this);
        this.findByIdOptional = this.findByIdOptional.bind(this);
    }

    @action
    public deleteAllById(ids: string[]): void {
        this.ids = this.ids.filter(id => !ids.includes(id));
    };

    @action
    public deleteById(idToDelete: string): void {
        this.ids = this.ids.filter(id => idToDelete !== id);
        delete this.entities[idToDelete];
    };

    public findById = createTransformer((id: string) => this.entities[id]);

    public findByIdOptional(id: string): Entity | undefined {
        return this.entities[id];
    };

    @action
    public insert(denormalizedEntity: DenormalizedEntity): Entity {
        const entity = this.convertToNormalizedForm(denormalizedEntity);
        this.entities[denormalizedEntity.id] = entity;
        // To ensure uniqueness of IDs
        this.ids = Array.from(new Set([...this.ids, denormalizedEntity.id]));
        return entity;
    };

    @action
    insertAll(entities: DenormalizedEntity[]): void {
        entities.forEach(entity => {
            this.entities[entity.id] = this.convertToNormalizedForm(entity);
            this.ids.push(entity.id);
        })
    };

    @action
    public insertAllEntities(entities: Entity[]): void {
        entities.forEach(entity => {
            this.entities[entity.id] = entity;
            this.ids.push(entity.id);
        })
    };

    @action
    public insertEntity(entity: Entity): Entity {
        this.entities[entity.id] = entity;
        this.ids.push(entity.id);
        return entity;
    };

    protected abstract convertToNormalizedForm(denormalizedEntity: DenormalizedEntity): Entity;
}
