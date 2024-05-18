import {RepositoriesMap} from "./RepositoriesMap";
import {Entities} from "../entities-store";

export interface Repositories {
	repositoriesMap: RepositoriesMap,

	getRepository<EntityName extends Entities>(entityName: EntityName): RepositoriesMap[EntityName] | undefined
}