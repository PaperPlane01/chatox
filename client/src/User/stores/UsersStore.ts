import {mergeWith} from "lodash";
import {computedFn} from "mobx-utils";
import {UserEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch, GetEntityType, RawEntityKey, RelationshipsIds} from "../../entities-store";
import {User} from "../../api/types/response";
import {mergeCustomizer} from "../../utils/object-utils";

interface UserInsertOptions {
    retrieveOnlineStatusFromExistingUser: boolean
}

export class UsersStore<UserType extends "users" | "reportedMessageSenders" | "reportedUsers"> extends AbstractEntityStore<
    UserType,
    GetEntityType<UserType>,
    User,
    UserInsertOptions> {

    findByIdWithRelationships(id: string): readonly [GetEntityType<UserType>, RelationshipsIds] {
        const user = this.findById(id);

        if (user.avatarId) {
            return [
                user,
                {
                    uploads: [user.avatarId]
                }
            ];
        } else {
            return [user, {}];
        }
    }

    findByIdOrSlug = computedFn((idOrSlug: string): UserEntity | undefined => {
       const user = this.findByIdOptional(idOrSlug);

       if (user) {
           return user;
       }

       return this.findAll().find(user => user.slug === idOrSlug);
    });

    createPatchForArray(denormalizedEntities: User[], options: UserInsertOptions = {retrieveOnlineStatusFromExistingUser: false}): EntitiesPatch {
        const patch = this.createEmptyPatch();
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(user => {
            const userEntity = this.convertToNormalizedForm(user);

            if (options.retrieveOnlineStatusFromExistingUser) {
                const existingUser = this.findByIdOptional(user.id);

                if (existingUser && !existingUser.onlineStatusMightBeInaccurate) {
                    userEntity.online = existingUser.online;
                    userEntity.lastSeen = existingUser.lastSeen
                } else {
                    userEntity.onlineStatusMightBeInaccurate = true;
                }
            }

            patch.entities[this.getEntityName()][userEntity.id] = userEntity;
            patch.ids[this.entityName].push(userEntity.id);

            if (user.avatar) {
                patches.push(this.entities.uploads.createPatch(user.avatar));
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    private getEntityName(): RawEntityKey {
        return this.entityName;
    }

    protected convertToNormalizedForm(denormalizedEntity: User): GetEntityType<UserType> {
        return {
            id: denormalizedEntity.id,
            bio: denormalizedEntity.bio,
            createdAt: new Date(denormalizedEntity.createdAt),
            dateOfBirth: denormalizedEntity.dateOfBirth ? new Date(denormalizedEntity.dateOfBirth) : undefined,
            externalAvatarUri: denormalizedEntity.externalAvatarUri,
            firstName: denormalizedEntity.firstName,
            lastName: denormalizedEntity.lastName,
            deleted: denormalizedEntity.deleted,
            slug: denormalizedEntity.slug,
            online: denormalizedEntity.online,
            lastSeen: denormalizedEntity.lastSeen ? new Date(denormalizedEntity.lastSeen) : undefined,
            avatarId: denormalizedEntity.avatar ? denormalizedEntity.avatar.id : undefined,
            onlineStatusMightBeInaccurate: denormalizedEntity.onlineStatusMightBeInaccurate
        } as GetEntityType<UserType>
    }
}