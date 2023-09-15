import {UploadResponse} from "../../uploads/types/responses";

export interface UserProfilePhotoDeleted {
    userId: string,
    upload: UploadResponse<any>
}
