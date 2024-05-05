import {UserEntity} from "../types";
import {AbstractRepository, Relationships} from "../../repository";
import {Upload} from "../../api/types/response";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {isDefined} from "../../utils/object-utils";

interface UserRelationships extends Relationships {
	uploads: Upload<any>[]
}

export class UserRepository extends AbstractRepository<UserEntity, UserRelationships> {
	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("users", "uploads");

		const user = await this.findOne({_id: id});

		if (!user) {
			return patch;
		}

		const relationships = await this.loadRelationships(user);

		populatePatch(patch, "users", [user]);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForEntities(entities: UserEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("users", "uploads");
		const relationships = await this.loadRelationshipsForArray(entities);

		populatePatch(patch, "users", entities);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async loadRelationships(entity: UserEntity): Promise<UserRelationships> {
		const relationships: UserRelationships = {
			uploads: []
		};

		if (!entity.avatarId) {
			return relationships;
		}

		const upload = await this.repositories.getRepository("uploads")?.findById(entity.avatarId);

		if (upload) {
			relationships.uploads.push(upload);
		}

		return relationships;
	}

	async loadRelationshipsForArray(entities: UserEntity[]): Promise<UserRelationships> {
		const relationships: UserRelationships = {
			uploads: []
		};

		const avatarsIds = entities.map(user => user.avatarId).filter(isDefined);

		const uploads = await this.repositories.getRepository("uploads")?.findAllById(avatarsIds) ?? [];

		relationships.uploads.push(...uploads);

		return relationships;
	}
}
