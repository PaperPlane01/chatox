import {Upload} from "../../mongoose/entities";
import {UploadInfoResponse} from "../types/response";

export class UploadMapper {
    public toUploadInfoResponse<Metadata>(upload: Upload<Metadata>): UploadInfoResponse<Metadata> {
        return {
            id: upload.id,
            extension: upload.extension,
            meta: upload.meta,
            mimeType: upload.mimeType,
            originalName: upload.originalName,
            size: upload.size,
            type: upload.type,
            thumbnail: upload.thumbnail && this.toUploadInfoResponse(upload.thumbnail),
            preview: upload.preview && this.toUploadInfoResponse(upload.preview),
            name: upload.name,
            isPreview: upload.isPreview,
            isThumbnail: upload.isThumbnail
        }
    }
}
