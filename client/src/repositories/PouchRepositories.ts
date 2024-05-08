import {makeAutoObservable} from "mobx";
import {RepositoriesMap} from "./RepositoriesMap";
import {Repositories} from "./Repositories";
import {MessagePouchRepository} from "../Message/repositories";
import {UploadPouchRepository} from "../Upload/repositories";
import {ChatRolePouchRepository} from "../ChatRole/repositories";
import {UserPouchRepository} from "../User/repositories";
import {StickerPackPouchRepository, StickerPouchRepository} from "../Sticker/repositories";
import {Entities} from "../entities-store";

export class PouchRepositories implements Repositories {
	repositoriesMap: RepositoriesMap = {};

	constructor() {
		makeAutoObservable(this);

		const databaseName = "pouch-db-chatox-database";
		this.repositoriesMap.messages = new MessagePouchRepository(databaseName, this);
		this.repositoriesMap.users = new UserPouchRepository(databaseName, this);
		this.repositoriesMap.uploads = new UploadPouchRepository(databaseName, this);
		this.repositoriesMap.chatRoles = new ChatRolePouchRepository(databaseName, this);
		this.repositoriesMap.stickers = new StickerPouchRepository(databaseName, this);
		this.repositoriesMap.stickerPacks = new StickerPackPouchRepository(databaseName, this);
	}

	getRepository<EntityName extends Entities>(entityName: EntityName): RepositoriesMap[EntityName] | undefined {
		return this.repositoriesMap[entityName];
	}
}