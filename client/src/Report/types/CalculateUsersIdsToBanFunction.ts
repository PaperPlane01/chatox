import {EntitiesStore} from "../../entities-store";

export type CalculateUsersIdsToBanFunction = (selectedReports: string[], entitiesStore: EntitiesStore) => string[];
