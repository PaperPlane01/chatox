import {UserEntity, UserRelationships} from "../types";
import {AbstractRelationshipsLoader} from "../../repository";
import {isDefined} from "../../utils/object-utils";
import {Repositories} from "../../repositories";

export class UserRelationshipsLoader extends AbstractRelationshipsLoader<UserEntity, UserRelationships> {
	constructor(private readonly repositories: Repositories) {
		super();
	}

	async loadRelationships(entity: UserEntity): Promise<UserRelationships> {
		const relationships: UserRelationships = this.createEmptyRelationships();

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
		const relationships: UserRelationships = this.createEmptyRelationships();

		const avatarsIds = entities.map(user => user.avatarId).filter(isDefined);

		const uploads = await this.repositories.getRepository("uploads")?.findAllById(avatarsIds) ?? [];

		relationships.uploads.push(...uploads);

		return relationships;
	}

	protected createEmptyRelationships(): UserRelationships {
		return {
			uploads: []
		};
	}
}