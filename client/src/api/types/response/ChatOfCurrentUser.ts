import {Message} from "./Message";
import {ChatParticipationWithoutUser} from "./ChatParticipationWithoutUser";

export interface ChatOfCurrentUser {
    id: string,
    name: string,
    avatarUri?: string,
    slug?: string,
    lastMessage?: Message,
    lastReadMessage?: Message,
    createdAt: string,
    chatParticipation?: ChatParticipationWithoutUser,
    unreadMessagesCount: number,
    participantsCount: number,
    description?: string
}
