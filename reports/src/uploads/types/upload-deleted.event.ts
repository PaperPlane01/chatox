import {UploadDeletionReason} from "./upload-deletion-reason";
import {UploadType} from "../enums";

export interface UploadDeletedEvent {
    uploadId: string;
    deletionReasons: UploadDeletionReason[];
    uploadType: UploadType;
}
