import {MessageRepository} from "./MessageRepository";
import {MessageEntity, MessageRelationships} from "../types";
import {AbstractRelationshipsLoader} from "../../repository";
import {Repositories} from "../../repositories";
import {emptyArray} from "../../utils/array-utils";
import {UserEntity} from "../../User";
import {isDefined} from "../../utils/object-utils";
import {Upload} from "../../api/types/response";
import {ChatRoleEntity} from "../../ChatRole/types";
import {StickerEntity} from "../../Sticker";

export class MessageRelationshipsLoader extends AbstractRelationshipsLoader<MessageEntity, MessageRelationships> {
	constructor(private readonly repositories: Repositories,
				private readonly messageRepository: MessageRepository) {
		super();
	}

	async loadRelationships(entity: MessageEntity): Promise<MessageRelationships> {
		const relationships = this.createEmptyRelationships();
		const {usersIds, chatRoleId, referredMessageId, uploadsIds, stickerId} = this.getRelationsIds(entity);
		const [users, chatRole, uploads, referredMessage, sticker] = await Promise.all([
			this.repositories.getRepository("users")?.findAllById(usersIds) ?? emptyArray<UserEntity>(),
			isDefined(chatRoleId) ? this.repositories.getRepository("chatRoles")?.findById(chatRoleId) : undefined,
			this.repositories.getRepository("uploads")?.findAllById(uploadsIds) ?? emptyArray<Upload<any>>(),
			isDefined(referredMessageId) ? this.messageRepository.findById(referredMessageId) : undefined,
			isDefined(stickerId) ? this.repositories.getRepository("stickers")?.findById(stickerId) : undefined
		]);

		relationships.users.push(...users);
		relationships.uploads.push(...uploads);

		if (chatRole) {
			relationships.chatRoles.push(chatRole);

			const chatRoleRelationships = await this.repositories.getRepository("chatRoles")?.loadRelationships(chatRole);

			if (chatRoleRelationships) {
				relationships.users.push(...chatRoleRelationships.users);
			}
		}

		if (sticker) {
			relationships.stickers.push(sticker);

			const stickerRelationships = await this.repositories.getRepository("stickers")?.loadRelationships(sticker);

			if (stickerRelationships) {
				relationships.uploads.push(...stickerRelationships.uploads);
			}
		}

		if (referredMessage) {
			// TODO: add safeguard against possible exceeding of recursion limit
			const referredMessageRelationships = await this.loadRelationships(referredMessage);

			relationships.users.push(...referredMessageRelationships.users);
			relationships.chatRoles.push(...referredMessageRelationships.chatRoles);
			relationships.uploads.push(...referredMessageRelationships.uploads);
			relationships.stickers.push(...referredMessageRelationships.stickers);
			relationships.messages.push(referredMessage);
		}

		return relationships;
	}

	async loadRelationshipsForArray(messages: MessageEntity[]): Promise<MessageRelationships> {
		const {usersIds, chatRolesIds, uploadsIds, referredMessagesIds, stickersIds} = this.getRelationsIdsForArray(messages);
		const [users, chatRoles, uploads, referredMessages, stickers] = await Promise.all([
			this.repositories.getRepository("users")?.findAllById(usersIds) ?? emptyArray<UserEntity>(),
			this.repositories.getRepository("chatRoles")?.findAllById(chatRolesIds) ?? emptyArray<ChatRoleEntity>(),
			this.repositories.getRepository("uploads")?.findAllById(uploadsIds) ?? emptyArray<Upload<any>>(),
			this.messageRepository.findAllById(referredMessagesIds),
			this.repositories.getRepository("stickers")?.findAllById(stickersIds) ?? emptyArray<StickerEntity>()
		]);

		const userRelationships = await this.repositories.getRepository("users")?.loadRelationshipsForArray(users);

		if (userRelationships) {
			uploads.push(...userRelationships.uploads);
		}

		const stickerRelationships = await this.repositories.getRepository("stickers")?.loadRelationshipsForArray(stickers);

		if (stickerRelationships) {
			uploads.push(...stickerRelationships.uploads);
		}

		const chatRoleRelationships = await this.repositories.getRepository("chatRoles")?.loadRelationshipsForArray(chatRoles);

		if (chatRoleRelationships) {
			users.push(...chatRoleRelationships.users);
		}

		if (referredMessages.length !== 0) {
			// TODO: add safeguard against possible exceeding of recursion limit
			const referredMessagesRelationships = await this.loadRelationshipsForArray(referredMessages);
			users.push(...referredMessagesRelationships.users);
			chatRoles.push(...referredMessagesRelationships.chatRoles);
			uploads.push(...referredMessagesRelationships.uploads);
			stickers.push(...referredMessagesRelationships.stickers);
			referredMessages.push(...referredMessagesRelationships.messages);
		}

		return {users, chatRoles, uploads, messages: referredMessages, stickers};
	}

	private getRelationsIds(message: MessageEntity) {
		const chatRoleId = message.senderRoleId;
		const stickerId = message.stickerId;
		const uploadsIds = message.uploads;
		const referredMessageId = message.referredMessageId;

		const usersIds: string[] = [];

		usersIds.push(message.sender);

		if (message.forwardedById) {
			usersIds.push(message.forwardedById);
		}

		if (message.mentionedUsers.length !== 0) {
			usersIds.push(...message.mentionedUsers)
		}

		return {usersIds, chatRoleId, stickerId, uploadsIds, referredMessageId};
	}

	private getRelationsIdsForArray(messages: MessageEntity[]) {
		const usersIds: string[] = [];
		const chatRolesIds: string[] = [];
		const uploadsIds: string[] = [];
		const referredMessagesIds: string[] = [];
		const stickersIds: string[] = [];

		for (const message of messages) {
			usersIds.push(message.sender);

			if (message.forwardedById) {
				usersIds.push(message.forwardedById);
			}

			if (message.mentionedUsers.length !== 0) {
				usersIds.push(...message.mentionedUsers);
			}

			if (message.senderRoleId) {
				chatRolesIds.push(message.senderRoleId);
			}

			if (message.uploads) {
				uploadsIds.push(...message.uploads);
			}

			if (message.referredMessageId) {
				referredMessagesIds.push(message.referredMessageId);
			}

			if (message.stickerId) {
				stickersIds.push(message.stickerId);
			}
		}

		return {usersIds, chatRolesIds, uploadsIds, referredMessagesIds, stickersIds};
	}

	protected createEmptyRelationships(): MessageRelationships {
		return {
			users: [],
			chatRoles: [],
			uploads: [],
			stickers: [],
			messages: []
		};
	}
}