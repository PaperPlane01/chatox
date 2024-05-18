import {useEffect} from "react";
import {Entities, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

type UseEntityById = <T extends Exclude<Entities, "chatUploads">, ID extends string | undefined | null>(
	entityName: T,
	id: ID
) => ID extends string ? GetEntityType<T> : undefined;

export const useEntityById: UseEntityById = (entityName, entityId) => {
	const {
		entities,
		referencedEntities: {
			increaseReferenceCount,
			decreaseReferenceCount
		}
	} = useStore();

	const entity = isDefined<string>(entityId)
		? entities.stores[entityName].findById(entityId) as GetEntityType<typeof entityName>
		: undefined;

	useEffect(() => {
		if (entityId) {
			increaseReferenceCount(entityName, entityId);

			return () => decreaseReferenceCount(entityName, entityId);
		}
	}, [entityId]);

	// Typescript keeps yelling that "undefined" is not assignable to return type of UseEntityById,
	// even though we explicitly specified it as possible return type in type definition.
	// So we have to use "as any" hack.
	return entity as any;
};
