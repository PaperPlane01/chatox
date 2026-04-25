import {UserRepository} from "./UserRepository";
import {UserRelationshipsLoader} from "./UserRelationshipsLoader";
import {UserEntityPatchLoader} from "./UserEntityPatchLoader";
import {UserEntity, UserRelationships} from "../types";
import {AbstractDexieRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {ChatoxDexieDatabase, Repositories} from "../../repositories";


export class UserDexieRepository extends AbstractDexieRepository<UserEntity, UserRelationships> implements UserRepository {
	private readonly relationshipsLoader: UserRelationshipsLoader;
	private readonly entityPatchLoader: UserEntityPatchLoader;

	constructor(database: ChatoxDexieDatabase, repositories: Repositories) {
		super(database.users, database);
		this.relationshipsLoader = new UserRelationshipsLoader(repositories);
		this.entityPatchLoader = new UserEntityPatchLoader(this, this.relationshipsLoader);
	}

	async restoreEntityPatch(id: string): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatch(id);
	}

	async restoreEntityPatchForEntities(entities: UserEntity[]): Promise<EntitiesPatch> {
		return this.entityPatchLoader.restoreEntityPatchForEntities(entities);
	}

	async loadRelationships(entity: UserEntity): Promise<UserRelationships> {
		return this.relationshipsLoader.loadRelationships(entity);
	}

	async loadRelationshipsForArray(entities: UserEntity[]): Promise<UserRelationships> {
		return this.relationshipsLoader.loadRelationshipsForArray(entities);
	}
}
