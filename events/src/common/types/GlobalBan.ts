import {User} from "./User";

export interface GlobalBan {
    id: string,
    expiresAt: string,
    createdAt: string,
    createdBy: User,
    bannedUser: User,
    canceled: boolean,
    canceledAt?: string,
    canceledBy?: User,
    permanent: boolean,
    reason: string,
    comment?: string,
    updatedAt?: string,
    updatedBy?: User
}
