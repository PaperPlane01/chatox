import {Entities, PopulatedEntitiesPatch} from "./types";

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
}