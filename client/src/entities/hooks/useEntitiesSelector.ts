import {useEffect} from "react";
import {Entities, EntitiesStore, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";

type UseEntitiesSelector = <T extends Exclude<Entities, "chatUploads">, R extends GetEntityType<T>>(
	entityName: T,
	select: (entities: EntitiesStore) => Array<R>
) => Array<R>;

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
