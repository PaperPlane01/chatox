import {ChatRole} from "../../api/types/response";

export interface ChatParticipationEntity {
    id: string,
    role: ChatRole,
    userId: string,
    chatId: string,
    activeChatBlockingId?: string
}
