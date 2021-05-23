import {UserRole} from "./UserRole";
import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {GlobalBan} from "./GlobalBan";

export interface CurrentUser {
    id: string,
    slug?: string,
    bio?: string,
    firstName: string,
    lastName?: string,
    avatarId?: string,
    avatar?: Upload<ImageUploadMetadata>,
    accountId: string,
    roles: UserRole[],
    createdAt: string,
    dateOfBirth?: string,
    email?: string,
    globalBan?: GlobalBan,
    externalAvatarUri?: string
}
