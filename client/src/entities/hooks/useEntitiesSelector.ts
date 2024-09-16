import {Entities, EntitiesStore, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";
import {useEffect} from "react";

type UseEntitiesSelector = <T extends Exclude<Entities, "chatUploads">>(
	entityName: T,
	select: (entities: EntitiesStore) => Array<GetEntityType<T>>
) => Array<GetEntityType<T>>;

export const useEntitiesSelector: UseEntitiesSelector = (entityName, select) => {
	const {
		entities,
		referencedEntities: {
			increaseReferenceCount,
			decreaseReferenceCount
		}
	} = useStore();

	const result = select(entities);

	useEffect(() => {
		if (result.length !== 0) {
			result.forEach(entity => increaseReferenceCount(entityName, entity.id));
		}

		return () => {
			if (result.length !== 0) {
				result.forEach(entity => decreaseReferenceCount(entityName, entity.id));
			}
		}
	}, []);

	return result;
};
