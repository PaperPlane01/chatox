import {UploadType} from "../../../mongoose/entities";

export interface UploadInfoResponse<MetadataType> {
    id: string,
    extension: string,
    mimeType: string,
    type: UploadType,
    meta: MetadataType,
    size: number,
    originalName: string,
    thumbnail?: UploadInfoResponse<MetadataType>,
    name: string
}
