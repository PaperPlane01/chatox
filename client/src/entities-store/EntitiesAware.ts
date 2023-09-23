import {EntitiesStore} from "./EntitiesStore";

export interface EntitiesAware {
    setEntities: (entities: EntitiesStore) => void
}
