export interface ChatBlockingEntity {
    id: string,
    blockedUserId: string,
    blockedById: string,
    blockedUntil: Date,
    description?: string,
    canceled: boolean,
    canceledAt?: Date,
    canceledByUserId?: string,
    lastModifiedAt?: Date,
    lastModifiedByUserId?: string,
    chatId: string
}
