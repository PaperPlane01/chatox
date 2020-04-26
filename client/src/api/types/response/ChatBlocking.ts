import {User} from "./User";

export interface ChatBlocking {
    id: string,
    blockedUser: User,
    blockedBy: User,
    blockedUntil: string,
    description?: string,
    canceled: boolean,
    canceledAt?: string,
    canceledBy?: User,
    lastModifiedAt?: string,
    lastModifiedBy?: User,
    chatId: string
}
