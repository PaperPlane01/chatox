import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";

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
    avatar?: Upload<ImageUploadMetadata>
}
