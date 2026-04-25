import {EntityPatchLoader} from "../../repository";
import {ChatRoleEntity} from "../types";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {ChatRoleRepository} from "./ChatRoleRepository";
import {ChatRoleRelationshipsLoader} from "./ChatRoleRelationshipsLoader";

export class ChatRoleEntityPatchLoader implements EntityPatchLoader<ChatRoleEntity> {
	constructor(private readonly repository: ChatRoleRepository,
				private readonly relationshipsLoader: ChatRoleRelationshipsLoader) {
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("chatRoles", "users", "uploads");
		const chatRole = await this.repository.findById(id);

		if (!chatRole) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationships(chatRole);

		populatePatch(patch, "chatRoles", [chatRole]);
		populatePatch(patch, "users", relationships.users);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const chatRoles = await this.repository.findAllById(ids);
		return this.restoreEntityPatchForEntities(chatRoles);
	}

	async restoreEntityPatchForEntities(entities: ChatRoleEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("chatRoles", "users", "uploads");
		const relationships = await this.relationshipsLoader.loadRelationshipsForArray(entities);

		populatePatch(patch, "chatRoles", entities);
		populatePatch(patch, "users", relationships.users);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}
}
