import {ChatRoleRepository} from "./ChatRoleRepository";
import {ChatRoleRelationshipsLoader} from "./ChatRoleRelationshipsLoader";
import {ChatRoleEntityPatchLoader} from "./ChatRoleEntityPatchLoader";
import {ChatRoleEntity, ChatRoleRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";
import {EntitiesPatch} from "../../entities-store";

export class ChatRoleDexieRepository extends AbstractDexieRepository<ChatRoleEntity, ChatRoleRelationships> implements ChatRoleRepository {
	private readonly relationshipsLoader: ChatRoleRelationshipsLoader;
	private readonly entityPatchLoader: ChatRoleEntityPatchLoader;

	constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
		super(database.chatRoles, database);
		this.relationshipsLoader = new ChatRoleRelationshipsLoader(repositories);
		this.entityPatchLoader = new ChatRoleEntityPatchLoader(this, this.relationshipsLoader);
	}

	async findByChatId(chatId: string): Promise<ChatRoleEntity[]> {
		return this.table.where("chatId").equals(chatId).toArray();
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
