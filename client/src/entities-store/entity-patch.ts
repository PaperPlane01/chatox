import {Entities, EntitiesPatch, GetEntityType, PopulatedEntitiesPatch} from "./types";
import {BaseEntity} from "../entity-store";

export const createEmptyEntitiesPatch = <T extends Entities>(...entities: T[]): PopulatedEntitiesPatch<T> => {
    const patch: EntitiesPatch = {
        entities: {}
    }
    entities.forEach(entityType => patch.entities[entityType] = new Map());
    return patch as unknown as PopulatedEntitiesPatch<T>;
};

export const populatePatch = <T extends Entities>(patch: PopulatedEntitiesPatch<T>, entityName: T, entities: Array<GetEntityType<T>>): void => {
    if (entities.length === 0) {
        return;
    }

    for (const entity of entities) {
        const entitiesMap: Map<string, BaseEntity> = patch.entities[entityName]!;
        entitiesMap.set(entity.id, entity);
    }
};
