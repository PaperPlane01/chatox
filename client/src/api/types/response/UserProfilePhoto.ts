import {Upload} from "./Upload";
import {ImageUploadMetadata} from "./ImageUploadMetadata";

export interface UserProfilePhoto {
    id: string,
    upload: Upload<ImageUploadMetadata>
}
