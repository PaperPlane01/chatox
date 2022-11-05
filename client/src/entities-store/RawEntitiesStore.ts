import {action, observable} from "mobx";
import {merge, union} from "lodash";
import {Entities, EntitiesIds, EntitiesPatch, RawEntities} from "./types";

export class RawEntitiesStore {
    @observable
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
        reportedMessagesSenders: {},
        reportedUsers: {},
        reportedChats: {},
        stickers: {},
        stickerPacks: {},
        chatRoles: {}
    };

    @observable
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
        reportedMessagesSenders: [],
        reportedUsers: [],
        reportedChats: [],
        stickers: [],
        stickerPacks: [],
        chatRoles: []
    };

    @action
    applyPatch = (patch: EntitiesPatch): void => {
        merge(this.entities, patch.entities);

        Object.keys(patch.ids).forEach(key => {
            const entity = key as Entities;
            this.ids[entity] = union(this.ids[entity], patch.ids[entity]);
        });
    }

    @action
    deleteEntity = (entityName: Entities, id: string): void => {
        this.ids[entityName] = this.ids[entityName].filter(entityId => entityId !== id);
        delete this.entities[entityName][id];
    }
}