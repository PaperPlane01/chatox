import {ImageUploadMetadata, UploadType} from "../../entities";

export class UploadResponse<MetadataType> {
    id: string;
    extension: string;
    mimeType: string;
    type: UploadType;
    meta?: MetadataType;
    size: number;
    originalName: string;
    previewImage?: UploadResponse<ImageUploadMetadata>;
    thumbnails: UploadResponse<ImageUploadMetadata>[];
    name: string;
    isThumbnail: boolean;
    isPreview: boolean;
    uri: string;
    originalId?: string;

    constructor(uploadResponse: UploadResponse<MetadataType>) {
        Object.assign(this, uploadResponse);
    }
}