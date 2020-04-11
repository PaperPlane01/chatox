import {UserEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {User} from "../../api/types/response";

export class UsersStore extends AbstractEntityStore<User, UserEntity> {

    protected convertToNormalizedForm(denormalizedEntity: User): UserEntity {
        return denormalizedEntity;
    }
}
