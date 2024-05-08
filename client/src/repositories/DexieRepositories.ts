import {Repositories} from "./Repositories";
import {RepositoriesMap} from "./RepositoriesMap";
import {ChatoxDexieDatabase} from "./ChatoxDexieDatabase";
import {Entities} from "../entities-store";
import {MessageDexieRepository} from "../Message/repositories";
import {UserDexieRepository} from "../User/repositories";
import {StickerDexieRepository, StickerPackDexieRepository} from "../Sticker/repositories";
import {UploadDexieRepository} from "../Upload/repositories";
import {ChatRoleDexieRepository} from "../ChatRole/repositories";

export class DexieRepositories implements Repositories {
	repositoriesMap: RepositoriesMap = {};

	constructor() {
		const database = new ChatoxDexieDatabase();
		this.repositoriesMap.messages = new MessageDexieRepository(database, this);
		this.repositoriesMap.users = new UserDexieRepository(database, this);
		this.repositoriesMap.uploads = new UploadDexieRepository(database);
		this.repositoriesMap.chatRoles = new ChatRoleDexieRepository(database, this);
		this.repositoriesMap.stickers = new StickerDexieRepository(database, this);
		this.repositoriesMap.stickerPacks = new StickerPackDexieRepository(database, this);
	}

	getRepository<EntityName extends Entities>(entityName: EntityName): RepositoriesMap[EntityName] | undefined {
		return this.repositoriesMap[entityName];
	}

}