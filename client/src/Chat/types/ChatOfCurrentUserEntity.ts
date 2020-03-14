export interface ChatOfCurrentUserEntity {
    id: string,
    name: string,
    avatarUri?: string,
    slug?: string,
    lastMessage?: string,
    lastReadMessage?: string,
    createdAt: Date,
    messages: string[],
    unreadMessagesCount: number,
    participantsCount: number,
    participants: string[],
    currentUserParticipationId?: string,
    description?: string
}
