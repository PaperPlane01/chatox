import {EntitiesStoreV2} from "../../entities-store";

export type CalculateUsersIdsToBanFunction = (selectedReports: string[], entitiesStore: EntitiesStoreV2) => string[];
