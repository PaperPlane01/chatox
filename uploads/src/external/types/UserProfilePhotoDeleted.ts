import {UploadResponse} from "../../uploads/types/responses";

export interface UserProfilePhotoDeleted {
    id: string,
    upload: UploadResponse<any>
}
