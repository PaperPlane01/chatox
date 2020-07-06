import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {UploadType} from "./UploadType";

export interface Upload<MetadataType> {
    id: string,
    extension: string,
    mimeType: string,
    type: UploadType,
    meta?: MetadataType,
    size: number,
    originalName: string,
    thumbnail?: Upload<ImageUploadMetadata>,
    preview?: Upload<ImageUploadMetadata>,
    name: string,
    isThumbnail: boolean,
    isPreview: boolean,
    uri: string
}
