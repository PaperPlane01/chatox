import {ImageUploadMetadata, UploadType} from "../../../mongoose/entities";

export interface UploadInfoResponse<MetadataType> {
    id: string,
    extension: string,
    mimeType: string,
    type: UploadType,
    meta?: MetadataType,
    size: number,
    originalName: string,
    previewImage?: UploadInfoResponse<ImageUploadMetadata>,
    thumbnails: UploadInfoResponse<ImageUploadMetadata>[],
    name: string,
    isThumbnail: boolean,
    isPreview: boolean,
    uri: string,
    originalId?: string
}
