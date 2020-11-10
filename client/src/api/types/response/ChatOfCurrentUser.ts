import {Message} from "./Message";
import {ChatParticipationWithoutUser} from "./ChatParticipationWithoutUser";
import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {ChatDeletionReason} from "./ChatDeletionReason";

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
    onlineParticipantsCount: number,
    description?: string,
    avatar?: Upload<ImageUploadMetadata>,
    createdByCurrentUser: boolean,
    tags: string[],
    deleted: boolean,
    deletionReason?: ChatDeletionReason,
    deletionComment?: string
}
