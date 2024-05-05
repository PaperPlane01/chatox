import {makeAutoObservable} from "mobx";
import {merge, union} from "lodash";
import {Entities, EntitiesIds, EntitiesPatch, GetEntityMapType, GetEntityType, RawEntities} from "./types";
import {Repositories} from "../repositories";

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
        const entityNames = Object.keys(entities) as any as Entities[];
        const inserts: Array<Promise<any>> = [];

        for (const entityName of entityNames) {
            const repository = this.repositories.getRepository(entityName);

            if (repository) {
                const entityMap = entities[entityName]!;
                const entitiesArray = this.collectEntities(entityMap);
                inserts.push(repository.bulkUpsert(entitiesArray as []));
            }
        }

        await Promise.all(inserts);
    }

    private collectEntities = <EntityName extends Entities>(
        entityMap: GetEntityMapType<EntityName>
    ): Array<GetEntityType<EntityName>> => {
        const array: Array<GetEntityType<EntityName>> = [];
        Object.values(entityMap).forEach(entity => array.push(entity));
        return array;
    }

    deleteEntity = (entityName: Entities, id: string): void => {
        this.ids[entityName] = this.ids[entityName].filter(entityId => entityId !== id);
        delete this.entities[entityName][id];
    }
}