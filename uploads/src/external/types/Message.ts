import {UploadResponse} from "../../uploads/types/responses";

export interface Message {
    id: string,
    attachments: UploadResponse<any>[],
    fromScheduled: boolean
}