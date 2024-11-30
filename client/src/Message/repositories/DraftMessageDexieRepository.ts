import {DraftMessageRepository} from "./DraftMessageRepository";
import {MessageRelationshipsLoader} from "./MessageRelationshipsLoader";
import {MessageEntityPatchLoader} from "./MessageEntityPatchLoader";
import {MessageEntity, MessageRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";

export class DraftMessageDexieRepository extends AbstractDexieRepository<MessageEntity, MessageRelationships> implements DraftMessageRepository {
	private readonly relationshipsLoader: MessageRelationshipsLoader;
	private readonly entityPatchLoader: MessageEntityPatchLoader;

	constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
		super(database.draftMessages, database);
		this.relationshipsLoader = new MessageRelationshipsLoader(repositories, this);
		this.entityPatchLoader = new MessageEntityPatchLoader(this, this.relationshipsLoader, "draftMessages");
	}

	loadRelationships(entity: MessageEntity): Promise<MessageRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	loadRelationshipsForArray(entities: MessageEntity[]): Promise<MessageRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}

	restoreEntityPatchForEntities(entities: MessageEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async findByChatId(chatId: string): Promise<MessageEntity | undefined> {
		return (await this.table.where("chatId").equals(chatId).toArray())[0]
	}

	async deleteById(id: string): Promise<void> {
		await this.table.where("id").equals(id).delete();
	}

	async findAll(): Promise<MessageEntity[]> {
		return this.table.toArray();
	}

	findByChatIdIn(chatIds: string[]): Promise<MessageEntity[]> {
		return this.table.where("chatId").anyOf(chatIds).toArray();
	}
}