import {makeAutoObservable, observable} from "mobx";
import {mergeWith, unionBy} from "lodash";
import {Entities, EntitiesPatch, GetEntityType, PersistentEntities, RawEntities} from "./types";
import {Repositories} from "../repositories";
import {isDefined} from "../utils/object-utils";
import {KeyOfType} from "../utils/types";
import {BaseEntity} from "../entity-store";

type DateFieldsMap = {
    [EntityName in PersistentEntities]?: Array<KeyOfType<GetEntityType<EntityName>, Date | null | undefined>>
}

const SERIALIZABLE_DATE_FIELDS_MAP: DateFieldsMap = {
    messages: ["createdAt", "updatedAt", "scheduledAt"],
    draftMessages: ["createdAt", "updatedAt", "scheduledAt"],
    users: ["lastSeen", "createdAt", "dateOfBirth"],
    chatRoles: ["createdAt", "updatedAt"],
    messageReactions: ["createdAt"]
};
const ENTITIES_WITH_SERIALIZABLE_DATE_FIELDS = new Set(Object.keys(SERIALIZABLE_DATE_FIELDS_MAP) as PersistentEntities[]);

export class RawEntitiesStore {
    entities: RawEntities = {
        messages: observable.map(),
        chats: observable.map(),
        users: observable.map(),
        chatParticipations: observable.map(),
        chatBlockings: observable.map(),
        uploads: observable.map(),
        chatUploads: observable.map(),
        globalBans: observable.map(),
        scheduledMessages: observable.map(),
        reports: observable.map(),
        reportedMessages: observable.map(),
        reportedMessageSenders: observable.map(),
        reportedUsers: observable.map(),
        reportedChats: observable.map(),
        stickers: observable.map(),
        stickerPacks: observable.map(),
        chatRoles: observable.map(),
        rewards: observable.map(),
        userRewards: observable.map(),
        userInteractions: observable.map(),
        userProfilePhotos: observable.map(),
        chatInvites: observable.map(),
        pendingChatParticipations: observable.map(),
        draftMessages: observable.map(),
        stickerAnimationData: observable.map(),
        messageReactions: observable.map()
    };

    constructor(private readonly repositories: Repositories) {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    applyPatch(patch: EntitiesPatch, skipInsertingToDatabase: boolean = false, priority: "high" | "low" = "high"): void {
        Object.keys(patch.entities).forEach(key => {
            const entityName = key as Entities;
            const updates: Map<string, BaseEntity> = patch.entities[entityName]!;
            const currentEntities: Map<string, BaseEntity> = this.entities[entityName];

            updates.forEach((entity, id) => {
                const existingEntity = currentEntities.get(id);

                if (!existingEntity) {
                    currentEntities.set(id, entity);
                } else if (priority === "high") {
                    currentEntities.set(id, mergeWith(existingEntity, entity, this.ensureIdUniqueness));
                } else {
                    currentEntities.set(id, mergeWith(entity, existingEntity, this.ensureIdUniqueness));
                }
            });
        });

        if (!skipInsertingToDatabase) {
            this.insertEntitiesToDatabase(patch.entities);
        }
    }

    private ensureIdUniqueness(object: unknown, source: unknown): Array<any> | undefined {
        if (Array.isArray(object) && ((typeof object[0] === "object") || typeof (source as Array<any>)[0] === "object")) {
            return unionBy(object, source as Array<any>, item => item.id);
        }
    }

    private async insertEntitiesToDatabase(entities: Partial<EntitiesPatch["entities"]>): Promise<void> {
        const entityNames = Object.keys(entities) as any as PersistentEntities[];
        const inserts: Array<Promise<any>> = [];

        for (const entityName of entityNames) {
            const repository = this.repositories.getRepository(entityName);

            if (repository) {
                const entityMap = entities[entityName as PersistentEntities]! as unknown as Map<string, GetEntityType<PersistentEntities>>;
                const entitiesArray = this.collectEntities(entityName, entityMap);
                inserts.push(repository.bulkUpsert(entitiesArray as []));
            }
        }

        await Promise.all(inserts);
    }

    private collectEntities<EntityName extends PersistentEntities>(
        entityName: EntityName,
        entityMap: Map<string, GetEntityType<EntityName>>
    ): Array<GetEntityType<EntityName>> {
        const array: Array<GetEntityType<EntityName>> = [];
        entityMap.forEach(value => array.push(this.serialize(entityName, value)))
        return array;
    }

    private serialize<E extends PersistentEntities, T extends GetEntityType<E>>(entityName: E, obj: T): T {
        if (!ENTITIES_WITH_SERIALIZABLE_DATE_FIELDS.has(entityName)) {
            return JSON.parse(JSON.stringify(obj));
        }

        const dateFields = SERIALIZABLE_DATE_FIELDS_MAP[entityName]!;
        const pairs: Array<[keyof T, any]> = [];

        dateFields.forEach(field => {
            const value = obj[field as keyof T];

            if (isDefined(value)) {
                pairs.push([field as keyof T, value]);
            }
        });

        const serialized = JSON.parse(JSON.stringify(obj));

        pairs.forEach(([key, value]) => serialized[key] = value);

        return serialized;
    }

    deleteEntity(entityName: Entities, id: string, skipRemovingFromDatabase: boolean = false): void {
        this.entities[entityName].delete(id);

        if (!skipRemovingFromDatabase) {
            const repository = this.repositories.getRepository(entityName);
            repository?.deleteById(id);
        }
    }
}