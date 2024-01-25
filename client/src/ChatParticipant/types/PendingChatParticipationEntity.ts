export interface PendingChatParticipationEntity {
    id: string,
    chatId: string,
    userId: string,
    createdAt: Date,
    restoredChatParticipationId?: string
}
