import {MessageReactionRepository} from "./MessageReactionRepository";
import {MessageReactionRelationshipsLoader} from "./MessageReactionRelationshipsLoader";
import {MessageReactionEntityPatchLoader} from "./MessageReactionEntityPatchLoader";
import {MessageReactionEntity, MessageReactionRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";

export class MessageReactionDexieRepository extends AbstractDexieRepository<MessageReactionEntity>
    implements MessageReactionRepository {
    private readonly relationshipsLoader: MessageReactionRelationshipsLoader;
    private readonly entityPatchLoader: MessageReactionEntityPatchLoader;

    constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
        super(database.messageReactions, database);
        this.relationshipsLoader = new MessageReactionRelationshipsLoader(repositories);
        this.entityPatchLoader = new MessageReactionEntityPatchLoader(this, this.relationshipsLoader);
    }


    async loadRelationships(entity: MessageReactionEntity): Promise<MessageReactionRelationships> {
        return await this.relationshipsLoader.loadRelationships(entity);
    }

    async loadRelationshipsForArray(entities: MessageReactionEntity[]): Promise<MessageReactionRelationships> {
        return await this.relationshipsLoader.loadRelationshipsForArray(entities);
    }

    async restoreEntityPatchForEntities(entities: MessageReactionEntity[]): Promise<EntitiesPatch> {
        return await this.entityPatchLoader.restoreEntityPatchForEntities(entities);
    }

    findByMessageId(messageId: string): Promise<MessageReactionEntity[]> {
        return this.table.where({messageId}).toArray();
    }

    findByMessageIdAndEmojiId(messageId: string, emojiId: string): Promise<MessageReactionEntity[]> {
        return this.table.where({
            messageId,
            emojiId
        })
            .toArray();
    }

    findByMessageIdAndCreatedAtBetween(messageId: string, createdAtStart: Date, createdAtEnd: Date): Promise<MessageReactionEntity[]> {
        throw this.table.where("[messageId+createdAt]").between(
            [messageId, createdAtStart],
            [messageId, createdAtEnd]
        )
            .toArray();
    }
    findByMessageIdAndCreatedAtAfter(messageId: string, date: Date): Promise<MessageReactionEntity[]> {
        return this.table.where("[messageId+createdAt]").above([messageId, date]).toArray();
    }

    findByMessageIdAndEmojiIdAndCreatedAtBetween(messageId: string, emojiId: string, createdAtStart: Date, createdAtEnd: Date): Promise<MessageReactionEntity[]> {
        return this.table.where("[messageId+emojiId+createdAt]").between(
            [messageId, emojiId, createdAtStart],
            [messageId, emojiId, createdAtEnd]
        )
            .toArray();
    }
    findByMessageIdAndEmojiIdAndCreatedAtAfter(messageId: string, emojiId: string, date: Date): Promise<MessageReactionEntity[]> {
        return this.table.where("[messageId+emojiId+createdAt]").above(
            [messageId, emojiId, date]
        )
            .toArray();
    }
}