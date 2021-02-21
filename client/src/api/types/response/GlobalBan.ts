import {User} from "./User";
import {GlobalBanReason} from "./GlobalBanReason";

export interface GlobalBan {
    id: string,
    expiresAt?: string,
    createdAt: string,
    createdBy: User,
    bannedUser: User,
    canceled: boolean,
    canceledAt?: string,
    canceledBy?: User,
    permanent: boolean,
    reason: GlobalBanReason,
    comment?: string,
    updatedAt?: string,
    updatedBy?: User
}