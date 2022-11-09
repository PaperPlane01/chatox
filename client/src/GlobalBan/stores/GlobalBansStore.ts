import {mergeWith} from "lodash";
import {GlobalBanEntity} from "../types";
import {AbstractEntityStoreV2} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {GlobalBan, User} from "../../api/types/response";
import {isDefined, mergeCustomizer} from "../../utils/object-utils";

export class GlobalBansStore extends AbstractEntityStoreV2<"globalBans", GlobalBanEntity, GlobalBan> {
    protected convertToNormalizedForm(denormalizedEntity: GlobalBan): GlobalBanEntity {
        return {
            id: denormalizedEntity.id,
            bannedUserId: denormalizedEntity.bannedUser.id,
            canceledAt: denormalizedEntity.canceledAt ? new Date(denormalizedEntity.canceledAt) : undefined,
            canceledById: denormalizedEntity.canceledBy ? denormalizedEntity.canceledBy.id : undefined,
            comment: denormalizedEntity.comment,
            createdAt: new Date(denormalizedEntity.createdAt),
            createdById: denormalizedEntity.createdBy.id,
            deleted: denormalizedEntity.canceled,
            expiresAt: denormalizedEntity.expiresAt ? new Date(denormalizedEntity.expiresAt) : undefined,
            permanent: denormalizedEntity.permanent,
            reason: denormalizedEntity.reason,
            updatedAt: denormalizedEntity.updatedAt ? new Date(denormalizedEntity.updatedAt) : undefined,
            updatedById: denormalizedEntity.updatedBy ? denormalizedEntity.updatedBy.id : undefined
        }
    }

    createPatchForArray(denormalizedEntities: GlobalBan[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("globalBans", "users");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(globalBan => {
            patch.entities.globalBans[globalBan.id] = this.convertToNormalizedForm(globalBan);
            patch.ids.globalBans.push(globalBan.id);

            const users = [
                globalBan.createdBy,
                globalBan.bannedUser,
                globalBan.updatedBy,
                globalBan.canceledBy
            ]
                .filter(user => isDefined(user)) as User[];
            patches.push(this.entities.users.createPatchForArray(users));
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

}