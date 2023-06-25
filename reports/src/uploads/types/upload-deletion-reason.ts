import {UploadDeletionReasonType} from "../enums";

export interface UploadDeletionReason {
    sourceObjectId?: string;
    deletionReasonType: UploadDeletionReasonType;
}
