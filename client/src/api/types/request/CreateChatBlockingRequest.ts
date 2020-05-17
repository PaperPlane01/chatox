export interface CreateChatBlockingRequest {
    userId: string,
    description?: string,
    blockedUntil: string,
    deleteRecentMessages?: boolean,
    deleteMessagesSince?: string
}
