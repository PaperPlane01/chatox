import {MessageRepository} from "./MessageRepository";
import {MessageRelationshipsLoader} from "./MessageRelationshipsLoader";
import {MessageEntityPatchLoader} from "./MessageEntityPatchLoader";
import {MessageEntity, MessageRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";
import {EntitiesPatch} from "../../entities-store";

export class MessageDexieRepository extends AbstractDexieRepository<MessageEntity, MessageRelationships> implements MessageRepository {
	private readonly relationshipsLoader: MessageRelationshipsLoader;
	private readonly entityPatchLoader: MessageEntityPatchLoader;

	constructor(chatoxDexieDatabase: ChatoxDexieDatabase, repositories: Repositories) {
		super(chatoxDexieDatabase.messages, chatoxDexieDatabase);
		this.relationshipsLoader = new MessageRelationshipsLoader(repositories, this);
		this.entityPatchLoader = new MessageEntityPatchLoader(this, this.relationshipsLoader);
	}

	findByChatId(chatId: string): Promise<MessageEntity[]> {
		return this.table.where(chatId).equals(chatId).toArray();
	}

	findByChatIdAndCreatedAtBetween(chatId: string, createdAtBefore: Date, createdAtAfter: Date): Promise<MessageEntity[]> {
		return this.table.where("[chatId+createdAt]").between(
			[chatId, createdAtBefore],
			[chatId, createdAtAfter]
		)
			.toArray();
	}

	async loadRelationships(entity: MessageEntity): Promise<MessageRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: MessageEntity[]): Promise<MessageRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}

	async restoreEntityPatchForEntities(entities: MessageEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}
}
