import {Entities, GetEntityType, PopulatedEntitiesPatch} from "./types";

export const createEmptyEntitiesPatch = <T extends Entities>(...entities: T[]): PopulatedEntitiesPatch<T> => {
    const patch = {
        entities: {},
        ids: {}
    }

    entities.forEach(entityType => {
        (patch.entities as any)[entityType] = {};
        (patch.ids as any)[entityType] = [];
    });

    return patch as unknown as PopulatedEntitiesPatch<T>;
};

export const populatePatch = <T extends Entities>(patch: PopulatedEntitiesPatch<T>, entityName: T, entities: Array<GetEntityType<T>>): void => {
    if (entities.length === 0) {
        return;
    }

    for (const entity of entities) {
        const id = entity.id;
        patch.ids[entityName]!.push(id);
        (patch.entities[entityName] as any)[entity.id] = entity;
    }
};
