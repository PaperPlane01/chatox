import {Repositories} from "./Repositories";
import {RepositoriesMap} from "./RepositoriesMap";
import {ChatoxDexieDatabase} from "./ChatoxDexieDatabase";
import {Entities} from "../entities-store";
import {DraftMessageDexieRepository, MessageDexieRepository} from "../Message/repositories";
import {UserDexieRepository} from "../User/repositories";
import {
	StickerAnimationDataDexieRepository,
	StickerDexieRepository,
	StickerPackDexieRepository
} from "../Sticker/repositories";
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
		this.repositoriesMap.draftMessages = new DraftMessageDexieRepository(database, this);
		this.repositoriesMap.stickerAnimationData = new StickerAnimationDataDexieRepository(database);
	}

	getRepository<EntityName extends Entities>(entityName: EntityName): RepositoriesMap[EntityName] | undefined {
		return this.repositoriesMap[entityName];
	}

}