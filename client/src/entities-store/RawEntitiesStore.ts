import {makeAutoObservable} from "mobx";
import {merge, union} from "lodash";
import {Entities, EntitiesIds, EntitiesPatch, RawEntities} from "./types";

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
        chatInvites: {}
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
        chatInvites: []
    };

    constructor() {
        makeAutoObservable(this);
    }

    applyPatch = (patch: EntitiesPatch): void => {
        merge(this.entities, patch.entities);

        Object.keys(patch.ids).forEach(key => {
            const entity = key as Entities;
            this.ids[entity] = union(this.ids[entity], patch.ids[entity]);
        });
    }

    deleteEntity = (entityName: Entities, id: string): void => {
        this.ids[entityName] = this.ids[entityName].filter(entityId => entityId !== id);
        delete this.entities[entityName][id];
    }
}