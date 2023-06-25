import {UploadDeletionReason} from "../../../upload-references/entities";
import {UploadType} from "../../index";

export interface UploadDeleted {
    uploadId: string,
    uploadType: UploadType
    deletionReasons: UploadDeletionReason[],
}