import {useEffect} from "react";
import {Entities, EntitiesStore, GetEntityType} from "../../entities-store";
import {useStore} from "../../store";

type UseEntitySelector = <T extends Exclude<Entities, "chatUploads">, R extends GetEntityType<T> | null | undefined>(
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
        if (entity) {
            increaseReferenceCount(entityName, entity.id);
        }

		return () => {
            if (entity) {
                decreaseReferenceCount(entityName, entity.id)
            }
        };
	}, []);

	return entity as any;
};
