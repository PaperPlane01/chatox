import {UploadType} from "../../api/types/response/UploadType";

export interface ChatUploadEntity {
    id: string,
    createdAt: Date,
    uploadedCreatorId?: string,
    uploadSenderId: string,
    uploadId: string,
    type: UploadType
}
