import {Message} from "./Message";
import {ChatParticipationWithoutUser} from "./ChatParticipationWithoutUser";
import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {ChatDeletionReason} from "./ChatDeletionReason";
import {ChatType} from "./ChatType";
import {User} from "./User";
import {SlowMode} from "./SlowMode";
import {JoinAllowanceMap} from "./JoinAllowanceMap";

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
    deletionComment?: string,
    type: ChatType,
    user?: User,
    slowMode?: SlowMode,
    joinAllowanceSettings: Partial<JoinAllowanceMap>,
    hideFromSearch: boolean
}
