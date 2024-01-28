import {ChatDeletionReason, ChatType, JoinAllowanceMap, SlowMode} from "../../api/types/response";

export interface ChatOfCurrentUserEntity {
    id: string,
    name: string,
    avatarUri?: string,
    slug?: string,
    lastMessage?: string,
    lastReadMessage?: string,
    createdAt: Date,
    messages: string[],
    indexToMessageMap: {[index: number]: string}
    scheduledMessages: string[],
    unreadMessagesCount: number,
    participantsCount: number,
    onlineParticipantsCount: number,
    participants: string[],
    currentUserParticipationId?: string,
    description?: string,
    avatarId?: string,
    createdByCurrentUser: boolean,
    tags: string[],
    deleted: boolean,
    deletionReason?: ChatDeletionReason,
    deletionComment?: string,
    pinnedMessageId?: string,
    type: ChatType,
    userId?: string,
    slowMode?: SlowMode,
    joinAllowanceSettings: JoinAllowanceMap
}
