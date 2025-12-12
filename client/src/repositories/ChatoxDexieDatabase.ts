import Dexie, {Table} from "dexie";
import {MessageEntity} from "../Message";
import {UserEntity} from "../User";
import {Upload} from "../api/types/response";
import {StickerAnimationData, StickerEntity, StickerPackEntity} from "../Sticker";
import {ChatRoleEntity} from "../ChatRole/types";

export class ChatoxDexieDatabase extends Dexie {
	messages!: Table<MessageEntity, string>;
	users!: Table<UserEntity, string>;
	uploads!: Table<Upload<any>, string>;
	stickers!: Table<StickerEntity, string>;
	stickerPacks!: Table<StickerPackEntity, string>;
	chatRoles!: Table<ChatRoleEntity, string>;
	draftMessages!: Table<MessageEntity, string>;
	stickerAnimationData!: Table<StickerAnimationData, string>;

	constructor() {
		super("chatox-dexie-database");

		this.version(1).stores({
			messages: "id, chatId, createdAt, [chatId+createdAt]",
			users: "id",
			uploads: "id",
			stickers: "id, stickerPackId",
			stickerPacks: "id",
			chatRoles: "id, chatId",
			draftMessages: "id, chatId",
			stickerAnimationData: "id"
		});
	}
}