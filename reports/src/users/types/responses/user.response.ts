import {UploadResponse} from "../../../common/types";

export interface UserResponse {
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
    avatar?: UploadResponse,
}
