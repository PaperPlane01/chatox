import {Message} from "./Message";
import {ChatParticipationWithoutUser} from "./ChatParticipationWithoutUser";
import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";

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
    description?: string,
    avatar?: Upload<ImageUploadMetadata>,
    createdByCurrentUser: boolean,
    tags: string[]
}
