import {ImageUploadMetadata, UploadType} from "../../../mongoose/entities";

export interface UploadInfoResponse<MetadataType> {
    id: string,
    extension: string,
    mimeType: string,
    type: UploadType,
    meta?: MetadataType,
    size: number,
    originalName: string,
    thumbnail?: UploadInfoResponse<ImageUploadMetadata>,
    preview?: UploadInfoResponse<ImageUploadMetadata>,
    name: string,
    isThumbnail: boolean,
    isPreview: boolean,
    uri: string
}
