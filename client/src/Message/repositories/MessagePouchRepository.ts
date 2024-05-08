import {MessageRepository} from "./MessageRepository";
import {MessageEntityPatchLoader} from "./MessageEntityPatchLoader";
import {MessageRelationshipsLoader} from "./MessageRelationshipsLoader";
import {MessageEntity, MessageRelationships} from "../types";
import {AbstractPouchRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {Repositories} from "../../repositories";

export class MessagePouchRepository
	extends AbstractPouchRepository<MessageEntity, MessageRelationships>
	implements MessageRepository {

	private readonly relationshipsLoader: MessageRelationshipsLoader;
	private readonly entityPatchLoader: MessageEntityPatchLoader;

	constructor(databaseName: string, repositories: Repositories) {
		super(databaseName, repositories);
		this.relationshipsLoader = new MessageRelationshipsLoader(repositories, this);
		this.entityPatchLoader = new MessageEntityPatchLoader(this, this.relationshipsLoader);
	}

	async beforeInit(): Promise<void> {
		await this.addIndex(["chatId"]);
		await this.addIndex(["createdAt"]);
		await this.addIndex(["chatId", "createdAt"]);
	}

	async findByChatId(chatId: string): Promise<MessageEntity[]> {
		return this.find({
			chatId
		}, {
			sort: ["createdAt"]
		});
	}

	async findByChatIdAndCreatedAtBetween(
		chatId: string,
		createdAtBefore: Date,
		createdAtAfter: Date
	): Promise<MessageEntity[]> {
		return this.find({
			chatId,
			createdAt: {
				$gte: createdAtBefore,
				$lte: createdAtAfter
			}
		});
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
