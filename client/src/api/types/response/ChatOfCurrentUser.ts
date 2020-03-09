import {Message} from "./Message";

export interface ChatOfCurrentUser {
    id: string,
    name: string,
    avatarUri?: string,
    slug?: string,
    lastMessage?: Message,
    lastReadMessage?: Message,
    createdAt: string,
    chatParticipation: {
        id: string,
        role: "ADMIN" | "MODERATOR" | "USER"
    },
    unreadMessagesCount: number,
    participantsCount: number
}
