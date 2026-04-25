import {AbstractRelationshipsLoader} from "../../repository";
import {ChatRoleEntity, ChatRoleRelationships} from "../types";
import {isDefined} from "../../utils/object-utils";
import {Repositories} from "../../repositories";

export class ChatRoleRelationshipsLoader extends AbstractRelationshipsLoader<ChatRoleEntity, ChatRoleRelationships> {
	constructor(private readonly repositories: Repositories) {
		super();
	}

	async loadRelationships(entity: ChatRoleEntity): Promise<ChatRoleRelationships> {
		const relationships = this.createEmptyRelationships();
		const userRepository = this.repositories.getRepository("users");

		if (!entity.createdById) {
			return relationships;
		}

		if (!userRepository) {
			return relationships;
		}

		const user = await userRepository.findById(entity.createdById);

		if (!user) {
			return relationships;
		}

		const userRelationships = await userRepository.loadRelationships(user);
		relationships.users.push(user);
		relationships.uploads.push(...userRelationships.uploads);

		return relationships;
	}

	async loadRelationshipsForArray(entities: ChatRoleEntity[]): Promise<ChatRoleRelationships> {
		const relationships = this.createEmptyRelationships();
		const usersIds = entities.map(chatRole => chatRole.createdById).filter(isDefined);

		if (usersIds.length === 0) {
			return relationships;
		}

		const userRepository = this.repositories.getRepository("users");

		if (!userRepository) {
			return relationships;
		}

		const users = await userRepository.findAllById(usersIds);
		const userRelationships = await userRepository.loadRelationshipsForArray(users);

		relationships.users.push(...users);
		relationships.uploads.push(...userRelationships.uploads);

		return relationships;
	}

	protected createEmptyRelationships(): ChatRoleRelationships {
		return {
			users: [],
			uploads: []
		};
	}
}
