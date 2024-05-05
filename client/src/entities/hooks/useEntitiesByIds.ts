import {Entities, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";
import {useEffect} from "react";

type UseEntitiesByIds = <T extends Exclude<Entities, "chatUploads">>(
	entityName: T,
	ids: string[]
) => Array<GetEntityType<T>>;

export const useEntitiesByIds: UseEntitiesByIds = (entityName, ids) => {
	const {
		entities,
		referencedEntities: {
			increaseReferenceCount,
			decreaseReferenceCount
		}
	} = useStore();
	const result = ids.length !== 0
		? entities.stores[entityName].findAllById(ids) as Array<GetEntityType<typeof entityName>>
		: [];

	useEffect(() => {
		result.forEach(entity => increaseReferenceCount(entityName, entity.id));

		return () => {
			result.forEach(entity => decreaseReferenceCount(entityName, entity.id));
		}
	}, [ids]);

	return result;
};
