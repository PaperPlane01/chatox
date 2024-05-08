import {Entities} from "../entities-store";
import {MessageRepository} from "../Message/repositories";
import {UserRepository} from "../User/repositories";
import {UploadRepository} from "../Upload/repositories";
import {ChatRoleRepository} from "../ChatRole/repositories";
import {StickerPackRepository, StickerRepository} from "../Sticker/repositories";

type GetRepositoryType<Entity extends Entities> =
	Entity extends "messages" ? MessageRepository
	: Entity extends "users" ? UserRepository
	: Entity extends "uploads" ? UploadRepository
	: Entity extends "chatRoles" ? ChatRoleRepository
	: Entity extends "stickers" ? StickerRepository
	: Entity extends "stickerPacks" ? StickerPackRepository : never;

export type RepositoriesMap = {
	[Key in Entities]?: GetRepositoryType<Key>
}
