import {makeAutoObservable} from "mobx";
import {AuthorizationStore} from "../Authorization";
import {MessageRepository} from "../Message/repositories";
import {UploadRepository} from "../Upload/repositories";
import {ChatRoleRepository} from "../ChatRole/repositories";
import {UserRepository} from "../User/repositories";
import {StickerPackRepository, StickerRepository} from "../Sticker/repositories";
import {Entities} from "../entities-store";

type GetRepositoryType<Entity extends Entities> =
	Entity extends "messages" ? MessageRepository
	: Entity extends "users" ? UserRepository
	: Entity extends "uploads" ? UploadRepository
	: Entity extends "chatRoles" ? ChatRoleRepository
	: Entity extends "stickers" ? StickerRepository
	: Entity extends "stickerPacks" ? StickerPackRepository : never;

type RepositoriesMap = {
	[Key in Entities]?: GetRepositoryType<Key>
}

export class Repositories {
	repositoriesMap: RepositoriesMap = {};

	get currentUserId(): string | undefined {
		return this.authorization.currentUser?.id;
	}

	constructor(private readonly authorization: AuthorizationStore) {
		makeAutoObservable(this);

		const databaseName = "chatox-database";
		this.repositoriesMap.messages = new MessageRepository(databaseName, this);
		this.repositoriesMap.users = new UserRepository(databaseName, this);
		this.repositoriesMap.uploads = new UploadRepository(databaseName, this);
		this.repositoriesMap.chatRoles = new ChatRoleRepository(databaseName, this);
		this.repositoriesMap.stickers = new StickerRepository(databaseName, this);
		this.repositoriesMap.stickerPacks = new StickerPackRepository(databaseName, this);
	}

	public getRepository<Entity extends Entities>(entityName: Entity) {
		return this.repositoriesMap[entityName];
	}
}