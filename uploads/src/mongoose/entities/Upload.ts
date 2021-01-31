import {Document} from "mongoose";
import {UploadType} from "./UploadType";
import {ImageUploadMetadata} from "./ImageUploadMetadata";

export interface Upload<Metadata> extends Document {
    id: string,
    size: number,
    name: string,
    originalName: string,
    extension: string,
    mimeType: string,
    userId?: string,
    type: UploadType,
    meta?: Metadata,
    thumbnail?: Upload<ImageUploadMetadata>,
    previewImage?: Upload<ImageUploadMetadata>,
    thumbnails: Upload<ImageUploadMetadata>[]
    isThumbnail: boolean,
    isPreview: boolean,
    originalId?: string
}
