import {ChatRoleEntity} from "../types";
import {AbstractRepository, Relationships} from "../../repository";
import {UserEntity} from "../../User";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {id} from "date-fns/locale";
import {Upload} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";

interface ChatRoleRelationships extends Relationships {
	users: UserEntity[],
	uploads: Upload<any>[]
}

export class ChatRoleRepository extends AbstractRepository<ChatRoleEntity, ChatRoleRelationships> {
	async beforeInit() {
		await this.addIndex(["chatId"]);
	}

	public findByChatId(chatId: string): Promise<ChatRoleEntity[]> {
		return this.find({chatId});
	}


	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("chatRoles", "users", "uploads");
		const chatRole = await this.findById(id);

		if (!chatRole) {
			return patch;
		}

		const relationships = await this.loadRelationships(chatRole);

		populatePatch(patch, "chatRoles", [chatRole]);
		populatePatch(patch, "users", relationships.users);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
	}

	async restoreEntityPatchForEntities(entities: ChatRoleEntity[]): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("chatRoles", "users", "uploads");
		const relationships = await this.loadRelationshipsForArray(entities);

		populatePatch(patch, "chatRoles", entities);
		populatePatch(patch, "users", relationships.users);
		populatePatch(patch, "uploads", relationships.uploads);

		return patch;
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