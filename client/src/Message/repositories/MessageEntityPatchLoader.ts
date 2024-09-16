import {EntityPatchLoader} from "../../repository";
import {MessageEntity} from "../types";
import {createEmptyEntitiesPatch, EntitiesPatch, populatePatch} from "../../entities-store";
import {MessageRelationshipsLoader} from "./MessageRelationshipsLoader";
import {MessageRepository} from "./MessageRepository";

export class MessageEntityPatchLoader implements EntityPatchLoader<MessageEntity> {
	constructor(private readonly messageRepository: MessageRepository,
				private readonly messageRelationshipsLoader: MessageRelationshipsLoader) {
	}

	async restoreEntityPatchForArray(ids: string[]): Promise<EntitiesPatch> {
		const messages = await this.messageRepository.findAllById(ids);
		return this.restoreEntityPatchForEntities(messages);
	}


	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		const patch = createEmptyEntitiesPatch("messages", "users", "uploads", "stickers", "chatRoles");

		const message = await this.messageRepository.findById(id);

		if (!message) {
			return patch;
		}

		const relationships = await this.messageRelationshipsLoader.loadRelationships(message)

		populatePatch(patch, "messages", [message, ...relationships.messages]);
		populatePatch(patch, "users", relationships.users);
		populatePatch(patch, "chatRoles", relationships.chatRoles);
		populatePatch(patch, "uploads", relationships.uploads);
		populatePatch(patch, "stickers", relationships.stickers);

		return patch;
	}

	async restoreEntityPatchForEntities(entities: MessageEntity[]): Promise<EntitiesPatch> {
		if (entities.length === 0) {
			return {
				ids: {},
				entities: {}
			};
		}

		const patch = createEmptyEntitiesPatch("messages", "users", "uploads", "stickers", "chatRoles");

		const {users, chatRoles, uploads, messages: referredMessages, stickers} = await this.messageRelationshipsLoader.loadRelationshipsForArray(entities);

		populatePatch(patch, "messages", [...entities, ...referredMessages]);
		populatePatch(patch, "users", users);
		populatePatch(patch, "chatRoles", chatRoles);
		populatePatch(patch, "uploads", uploads);
		populatePatch(patch, "stickers", stickers);

		return patch;
	}

}