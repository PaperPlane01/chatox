import {makeAutoObservable} from "mobx";
import {merge, union} from "lodash";
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
    users: ["lastSeen", "createdAt", "dateOfBirth"],
    chatRoles: ["createdAt", "updatedAt"]
};
const ENTITIES_WITH_SERIALIZABLE_DATE_FIELDS = Object.keys(SERIALIZABLE_DATE_FIELDS_MAP) as PersistentEntities[];

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
        pendingChatParticipations: {}
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
        pendingChatParticipations: []
    };

    constructor(private readonly repositories: Repositories) {
        makeAutoObservable(this);
    }

    applyPatch = (patch: EntitiesPatch, skipInsertingToDatabase: boolean = false, priority: "high" | "low" = "high"): void => {
        if (priority === "high") {
            merge(this.entities, patch.entities);
        } else {
            this.entities = merge({}, patch.entities, this.entities);
        }

        Object.keys(patch.ids).forEach(key => {
            const entity = key as Entities;
            this.ids[entity] = union(this.ids[entity], patch.ids[entity]);
        });

        if (!skipInsertingToDatabase) {
            this.insertEntitiesToDatabase(patch.entities);
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

    private collectEntities = <EntityName extends PersistentEntities>(
        entityName: EntityName,
        entityMap: GetEntityMapType<EntityName>
    ): Array<GetEntityType<EntityName>> => {
        const array: Array<GetEntityType<EntityName>> = [];
        Object.values(entityMap).forEach(entity => array.push(this.serialize(entityName, entity)));
        return array;
    }

    private serialize = <T extends object>(entityName: PersistentEntities, obj: T): T => {
        if (!ENTITIES_WITH_SERIALIZABLE_DATE_FIELDS.includes(entityName)) {
            return JSON.parse(JSON.stringify(obj));
        }

        const dateFields = SERIALIZABLE_DATE_FIELDS_MAP[entityName]!;
        const pairs: Array<[keyof T, any]> = [];

        Object.keys(obj).filter(key => dateFields.includes(key as never)).forEach(key => {
            const value = obj[key as keyof T];

            if (isDefined(value)) {
                pairs.push([key as keyof T, value]);
            }
        });

        const serialized = JSON.parse(JSON.stringify(obj));

        pairs.forEach(([key, value]) => serialized[key] = value);

        return serialized;
    }

    deleteEntity = (entityName: Entities, id: string): void => {
        this.ids[entityName] = this.ids[entityName].filter(entityId => entityId !== id);
        delete this.entities[entityName][id];
    }
}