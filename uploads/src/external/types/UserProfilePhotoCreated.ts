import {UploadResponse} from "../../uploads/types/responses";

export interface UserProfilePhotoCreated {
    id: string,
    upload: UploadResponse<any>
}
