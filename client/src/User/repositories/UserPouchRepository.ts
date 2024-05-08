import {UserRepository} from "./UserRepository";
import {UserRelationshipsLoader} from "./UserRelationshipsLoader";
import {UserEntityPatchLoader} from "./UserEntityPatchLoader";
import {UserEntity, UserRelationships} from "../types";
import {AbstractPouchRepository} from "../../repository";
import {EntitiesPatch} from "../../entities-store";
import {Repositories} from "../../repositories";


export class UserPouchRepository extends AbstractPouchRepository<UserEntity, UserRelationships> implements UserRepository {
	private readonly relationshipsLoader: UserRelationshipsLoader;
	private readonly entityPatchLoader: UserEntityPatchLoader;

	constructor(databaseName: string, repositories: Repositories) {
		super(databaseName, repositories);
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
