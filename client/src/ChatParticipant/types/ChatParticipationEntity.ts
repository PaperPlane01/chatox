export interface ChatParticipationEntity {
    id: string,
    userId: string,
    chatId: string,
    activeChatBlockingId?: string,
    roleId: string
}
