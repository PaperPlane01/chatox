import {UploadDeletionReasonType} from "./UploadDeletionReasonType";
import {PartialBy} from "../../utils/types";

export class UploadDeletionReason {
    deletionReasonType: UploadDeletionReasonType;
    sourceObjectId?: string = undefined;

    constructor(object: PartialBy<UploadDeletionReason, "sourceObjectId">) {
        Object.assign(this, object);
    }
}