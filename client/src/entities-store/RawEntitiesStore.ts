import {makeAutoObservable} from "mobx";
import {mergeWith, union, unionBy} from "lodash";
import {
    Entities,
    EntitiesIds,
    EntitiesPatch,
    GetEntityMapType,
    GetEntityType,
    PersistentEntities,
    RawEntities
} from "./types";
import {Repositories} from "../repositories";
import {isDefined} from "../utils/object-utils";
import {KeyOfType} from "../utils/types";

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
        messages: {},
        chats: {},
        users: {},
        chatParticipations: {},
        chatBlockings: {},
        uploads: {},
        chatUploads: {},
        globalBans: {},
        scheduledMessages: {},
        reports: {},
        reportedMessages: {},
        reportedMessageSenders: {},
        reportedUsers: {},
        reportedChats: {},
        stickers: {},
        stickerPacks: {},
        chatRoles: {},
        rewards: {},
        userRewards: {},
        userInteractions: {},
        userProfilePhotos: {},
        chatInvites: {},
        pendingChatParticipations: {},
        draftMessages: {},
        stickerAnimationData: {},
        messageReactions: {}
    };

    ids: EntitiesIds = {
        messages: [],
        chats: [],
        users: [],
        chatParticipations: [],
        chatBlockings: [],
        uploads: [],
        chatUploads: [],
        globalBans: [],
        scheduledMessages: [],
        reports: [],
        reportedMessages: [],
        reportedMessageSenders: [],
        reportedUsers: [],
        reportedChats: [],
        stickers: [],
        stickerPacks: [],
        chatRoles: [],
        rewards: [],
        userRewards: [],
        userInteractions: [],
        userProfilePhotos: [],
        chatInvites: [],
        pendingChatParticipations: [],
        draftMessages: [],
        stickerAnimationData: [],
        messageReactions: []
    };

    constructor(private readonly repositories: Repositories) {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    applyPatch(patch: EntitiesPatch, skipInsertingToDatabase: boolean = false, priority: "high" | "low" = "high"): void {
        if (priority === "high") {
            mergeWith(this.entities, patch.entities, this.ensureIdUniqueness);
        } else {
            this.entities = mergeWith({}, patch.entities, this.entities, this.ensureIdUniqueness);
        }

        Object.keys(patch.ids).forEach(key => {
            const entity = key as Entities;
            this.ids[entity] = union(this.ids[entity], patch.ids[entity]);
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

    private async insertEntitiesToDatabase(entities: Partial<RawEntities>): Promise<void> {
        const entityNames = Object.keys(entities) as any as PersistentEntities[];
        const inserts: Array<Promise<any>> = [];

        for (const entityName of entityNames) {
            const repository = this.repositories.getRepository(entityName);

            if (repository) {
                const entityMap = entities[entityName]!;
                const entitiesArray = this.collectEntities(entityName, entityMap);
                inserts.push(repository.bulkUpsert(entitiesArray as []));
            }
        }

        await Promise.all(inserts);
    }

    private collectEntities<EntityName extends PersistentEntities>(
        entityName: EntityName,
        entityMap: GetEntityMapType<EntityName>
    ): Array<GetEntityType<EntityName>> {
        const array: Array<GetEntityType<EntityName>> = [];
        Object.values(entityMap).forEach(entity => array.push(this.serialize(entityName, entity)));
        return array;
    }

    private serialize<T extends object>(entityName: PersistentEntities, obj: T): T {
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

    deleteEntity(entityName: Entities, id: string, skipRemovingFromDatabase: boolean = false) {
        this.ids[entityName] = this.ids[entityName].filter(entityId => entityId !== id);
        delete this.entities[entityName][id];

        if (!skipRemovingFromDatabase) {
            const repository = this.repositories.getRepository(entityName);
            repository?.deleteById(id);
        }
    }
}