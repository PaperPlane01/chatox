import {GlobalBanEntity} from "../types";
import {SoftDeletableEntityStore} from "../../entity-store";
import {GlobalBan} from "../../api/types/response";

export class GlobalBansStore extends SoftDeletableEntityStore<GlobalBanEntity, GlobalBan> {
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
}