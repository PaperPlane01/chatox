import {mergeWith} from "lodash";
import {UserEntity} from "../types";
import {AbstractEntityStoreV2} from "../../entity-store";
import {User} from "../../api/types/response";
import {EntitiesPatch} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";

interface UserInsertOptions {
    retrieveOnlineStatusFromExistingUser: boolean
}

export class UsersStoreV2 extends AbstractEntityStoreV2<"users", UserEntity, User, UserInsertOptions> {

    createPatchForArray(denormalizedEntities: User[], options: UserInsertOptions = {retrieveOnlineStatusFromExistingUser: false}): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("users");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(user => {
            const userEntity = this.convertToNormalizedForm(user);
            patch.entities.users[userEntity.id] = userEntity;
            patch.ids.users.push(userEntity.id);

            if (user.avatar) {
                patches.push(this.entities.uploads.createPatch(user.avatar));
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: User): UserEntity {
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
        };
    }
}