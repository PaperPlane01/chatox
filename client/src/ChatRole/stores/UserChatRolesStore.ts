import {makeAutoObservable} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesAware, EntitiesStore} from "../../entities-store";

interface GetRoleOfUserInChatOptions {
    chatId: string,
    userId: string
}

interface InsertInCacheParameters extends GetRoleOfUserInChatOptions {
    roleId: string
}

export class UserChatRolesStore implements EntitiesAware {
    rolesCache: {
        [cacheKey: string]: string
    } = {};

    private entities: EntitiesStore;

    constructor() {
        makeAutoObservable(this);
    }

    setEntities = (entities: EntitiesStore): void => {
        this.entities = entities;
    }

    insertInCache = (parameters: InsertInCacheParameters): void => {
        const {userId, chatId, roleId} = parameters;
        const cacheKey = this.generateCacheKey(chatId, userId);

        this.rolesCache[cacheKey] = roleId;
    };

    getRoleOfUserInChat = createTransformer((options: GetRoleOfUserInChatOptions) => {
        let roleId: string | undefined = undefined;
        const cacheKey = this.generateCacheKey(options.chatId, options.userId);

        if (this.rolesCache[cacheKey]) {
            roleId = this.rolesCache[cacheKey];
        } else {
            const chatParticipation = this.entities.chatParticipations.findByUserAndChat(options);

            if (!chatParticipation) {
                return undefined;
            }

            roleId = chatParticipation.roleId;
            this.insertInCache({
                chatId: options.chatId,
                userId: options.userId,
                roleId
            });
        }

        return this.entities.chatRoles.findById(roleId);
    });

    private generateCacheKey = (chatId: string, userId: string): string => `${chatId}_${userId}`;
}