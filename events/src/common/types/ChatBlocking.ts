import {User} from "./User";

export interface ChatBlocking {
    id: string,
    blockedBy: User,
    blockedUntil: string,
    blockedUser: User,
    description?: string,
    canceled: boolean,
    canceledAt?: Date,
    canceledBy?: User,
    lastModifiedAt?: string,
    lastModifiedBy?: User
}
