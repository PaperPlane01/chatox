import {action, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {merge} from "lodash";
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
        this.findAllById = this.findAllById.bind(this);
        this.findAll = this.findAll.bind(this);
    }

    @action
    public deleteAllById(ids: string[]): void {
        this.ids = this.ids.filter(id => !ids.includes(id));
        ids.forEach(id => {
            if (this.entities[id]) {
                delete this.entities[id];
            }
        });
    }

    @action
    public deleteById(idToDelete: string): void {
        if (this.entities[idToDelete]) {
            this.ids = this.ids.filter(id => id !== idToDelete);
            delete this.entities[idToDelete];
        }
    }

    public findById = createTransformer((id: string) => this.entities[id]);

    public findByIdOptional(id: string): Entity | undefined {
        return this.entities[id];
    }

    @action
    public insert(denormalizedEntity: DenormalizedEntity): Entity {
        let entity = this.convertToNormalizedForm(denormalizedEntity);
        entity = this.insertEntity(entity);
        return entity;
    }

    @action
    public insertAll(entities: DenormalizedEntity[]): void {
        entities.forEach(entity => this.insert(entity));
    }

    @action
    public insertAllEntities(entities: Entity[]): void {
        entities.forEach(entity => this.insertEntity(entity))
    }

    @action
    public insertEntity(entity: Entity): Entity {
        if (this.entities[entity.id]) {
            this.entities[entity.id] = merge(this.entities[entity.id], entity);
        } else {
            this.entities[entity.id] = entity;
            this.ids = Array.from(new Set([...this.ids, entity.id]));
        }
        return entity;
    }

    public findAllById = createTransformer((ids: string[]) => {
        return ids.map(id => this.findById(id));
    })

    public findAll() {
        return this.findAllById(this.ids);
    }

    protected abstract convertToNormalizedForm(denormalizedEntity: DenormalizedEntity): Entity;
}
