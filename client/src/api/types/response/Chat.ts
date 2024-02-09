import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {ChatType} from "./ChatType";
import {User} from "./User";
import {SlowMode} from "./SlowMode";
import {JoinAllowanceMap} from "./JoinAllowanceMap";

export interface Chat {
    avatarUri?: string,
    createdByCurrentUser: boolean,
    description?: string,
    id: string,
    name: string,
    participantsCount: number,
    onlineParticipantsCount: number,
    slug?: string,
    tags: string[],
    createdAt: string,
    avatar?: Upload<ImageUploadMetadata>,
    type: ChatType,
    user?: User,
    slowMode?: SlowMode,
    joinAllowanceSettings: Partial<JoinAllowanceMap>,
    hideFromSearch: boolean
}
