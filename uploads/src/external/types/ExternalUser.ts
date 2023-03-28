import {UploadResponse} from "../../uploads/types/responses";
import {ImageUploadMetadata} from "../../uploads";

export interface ExternalUser {
    id: string,
    avatar?: UploadResponse<ImageUploadMetadata>
}