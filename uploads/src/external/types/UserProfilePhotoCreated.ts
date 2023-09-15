import {UploadResponse} from "../../uploads/types/responses";

export interface UserProfilePhotoCreated {
    userId: string,
    upload: UploadResponse<any>
}
