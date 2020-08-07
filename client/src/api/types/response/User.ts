import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {Upload} from "./Upload";

export interface User {
    id: string,
    firstName: string,
    lastName?: string,
    bio?: string,
    dateOfBirth?: string,
    slug?: string,
    avatarUri?: string,
    deleted: boolean,
    createdAt: string,
    online: boolean,
    lastSeen?: string,
    avatar?: Upload<ImageUploadMetadata>
}
