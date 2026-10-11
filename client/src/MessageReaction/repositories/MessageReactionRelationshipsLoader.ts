import {AbstractRelationshipsLoader} from "../../repository";
import {MessageReactionEntity, MessageReactionRelationships} from "../types";
import {Repositories} from "../../repositories";
import {emptyArray} from "../../utils/array-utils";

export class MessageReactionRelationshipsLoader extends AbstractRelationshipsLoader<MessageReactionEntity, MessageReactionRelationships> {
    constructor(private readonly repositories: Repositories) {
        super();
    }

    async loadRelationships(entity: MessageReactionEntity): Promise<MessageReactionRelationships> {
        return await this.loadRelationshipsForArray([entity]);
    }

    async loadRelationshipsForArray(entities: MessageReactionEntity[]): Promise<MessageReactionRelationships> {
        const usersIds = entities.map(entity => entity.userId);
        const users = await this.repositories.getRepository("users")?.findAllById(usersIds) ?? emptyArray();
        const userRelationships = await this.repositories.getRepository("users")?.loadRelationshipsForArray(users);
        const relationships = this.createEmptyRelationships();

        relationships.users.push(...users);

        if (userRelationships) {
            relationships.uploads.push(...userRelationships.uploads);
        }

        return relationships;
    }

    protected createEmptyRelationships(): MessageReactionRelationships {
        return {
            users: [],
            uploads: []
        };
    }
}