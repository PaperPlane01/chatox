import {GlobalBanReason} from "../../api/types/response";

export interface GlobalBanEntity {
    id: string,
    expiresAt?: Date,
    createdAt: Date,
    createdById: string,
    bannedUserId: string,
    deleted: boolean,
    canceledAt?: Date,
    canceledById?: string,
    permanent: boolean,
    reason: GlobalBanReason,
    comment?: string,
    updatedAt?: Date,
    updatedById?: string
}
