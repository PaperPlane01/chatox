import {UploadResponse} from "../../uploads/types/responses";
import {ImageUploadMetadata} from "../../uploads";

export interface Chat {
    id: string,
    avatar?: UploadResponse<ImageUploadMetadata>
}