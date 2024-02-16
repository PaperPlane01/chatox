import {User} from "./User";

export interface PendingChatParticipant {
    id: string,
    chatId: string,
    user: User,
    createdAt: string,
    restoredChatParticipationId?: string
}
