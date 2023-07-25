import {UploadType} from "../enums";

export class UploadResponse {
    id: string;
    name: string;
    uri: string;
    extension?: string;
    originalName: string;
    meta: any;
    mimeType: string;
    type: UploadType;
    preview?: UploadResponse;
    thumbnail?: UploadResponse;
    archivedAt?: Date;
}
