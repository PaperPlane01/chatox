import {action} from "mobx";
import {createTransformer} from "mobx-utils";
import {UserEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {User} from "../../api/types/response";

export class UsersStore extends AbstractEntityStore<UserEntity, User> {

    @action
    findByIdOrSlug = createTransformer((idOrSlug: string) => {
        const user = this.findByIdOptional(idOrSlug);

        if (user) {
            return user;
        } else {
            return this.ids.map(id => this.findById(id))
                .find(user => user.slug === idOrSlug);
        }
    });

    protected convertToNormalizedForm(denormalizedEntity: User): UserEntity {
        return {
            id: denormalizedEntity.id,
            bio: denormalizedEntity.bio,
            createdAt: new Date(denormalizedEntity.createdAt),
            dateOfBirth: denormalizedEntity.dateOfBirth ? new Date(denormalizedEntity.dateOfBirth) : undefined,
            avatarUri: denormalizedEntity.avatarUri,
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
