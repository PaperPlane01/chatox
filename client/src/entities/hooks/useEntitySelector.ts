import {useEffect} from "react";
import {Entities, EntitiesStore, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";

type UseEntitySelector = <T extends Exclude<Entities, "chatUploads">, R extends GetEntityType<T>>(
	entityName: T,
	select: (entities: EntitiesStore) => R
) => R;

export const useEntitySelector: UseEntitySelector = (entityName, select) => {
	const {
		entities,
		referencedEntities: {
			increaseReferenceCount,
			decreaseReferenceCount
		}
	} = useStore();

	const entity = select(entities);

	useEffect(() => {
		increaseReferenceCount(entityName, entity.id);

		return () => decreaseReferenceCount(entityName, entity.id);
	}, []);

	return entity as any;
};
