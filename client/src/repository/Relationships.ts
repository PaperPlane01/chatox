import {Entities, GetEntityType} from "../entities-store";

export type Relationships = {
	[EntityName in Entities]?: Array<GetEntityType<EntityName>>
}
