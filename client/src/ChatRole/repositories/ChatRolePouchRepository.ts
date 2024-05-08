import {ChatRoleRepository} from "./ChatRoleRepository";
import {ChatRoleEntityPatchLoader} from "./ChatRoleEntityPatchLoader";
import {ChatRoleRelationshipsLoader} from "./ChatRoleRelationshipsLoader";
import {ChatRoleEntity, ChatRoleRelationships} from "../types";
import {AbstractPouchRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {Repositories} from "../../repositories";

export class ChatRolePouchRepository extends AbstractPouchRepository<ChatRoleEntity, ChatRoleRelationships> implements ChatRoleRepository {
	private readonly relationshipsLoader: ChatRoleRelationshipsLoader;
	private readonly entityPatchLoader: ChatRoleEntityPatchLoader;

	constructor(databaseName: string, repositories: Repositories) {
		super(databaseName, repositories);
		this.relationshipsLoader = new ChatRoleRelationshipsLoader(repositories);
		this.entityPatchLoader = new ChatRoleEntityPatchLoader(this, this.relationshipsLoader);
	}

	async beforeInit() {
		await this.addIndex(["chatId"]);
	}

	public findByChatId(chatId: string): Promise<ChatRoleEntity[]> {
		return this.find({chatId});
	}


	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}

	async restoreEntityPatchForEntities(entities: ChatRoleEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async loadRelationships(entity: ChatRoleEntity): Promise<ChatRoleRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: ChatRoleEntity[]): Promise<ChatRoleRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}
}