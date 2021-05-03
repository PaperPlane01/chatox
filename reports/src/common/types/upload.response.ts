export class UploadResponse {
    id: string;
    name: string;
    uri: string;
    extension?: string;
    originalName: string;
    meta: any;
    mimeType: string;
    type: string;
    preview?: UploadResponse;
    thumbnail?: UploadResponse;
}
