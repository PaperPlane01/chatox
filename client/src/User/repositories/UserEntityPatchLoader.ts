import {EntityPatchLoader} from "../../repository";
import {UserEntity} from "../types";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {UserRepository} from "./UserRepository";
import {UserRelationshipsLoader} from "./UserRelationshipsLoader";

export class UserEntityPatchLoader implements EntityPatchLoader<UserEntity> {
	constructor(private readonly repository: UserRepository, private readonly relationshipsLoader: UserRelationshipsLoader) {
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("users", "uploads");

		const user = await this.repository.findById(id);

		if (!user) {
			return patch;
		}

		const relationships = await this.relationshipsLoader.loadRelationships(user);

		populatePatch(patch, "users", [user]);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const users = await this.repository.findAllById(ids);
		return this.restoreEntityPatchForEntities(users);
	}

	async restoreEntityPatchForEntities(entities: UserEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("users", "uploads");
		const relationships = await this.relationshipsLoader.loadRelationshipsForArray(entities);

		populatePatch(patch, "users", entities);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}
}
