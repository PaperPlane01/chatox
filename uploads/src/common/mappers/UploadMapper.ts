import {Upload} from "../../mongoose/entities";
import {UploadInfoResponse} from "../types/response";

export class UploadMapper {
    public toUploadInfoResponse<Metadata>(upload: Upload<Metadata>): UploadInfoResponse<Metadata> {
        console.log(upload.name);
        return {
            id: upload.id,
            extension: upload.extension,
            meta: upload.meta,
            mimeType: upload.mimeType,
            originalName: upload.originalName,
            size: upload.size,
            type: upload.type,
            thumbnail: upload.thumbnail && this.toUploadInfoResponse(upload.thumbnail),
            name: upload.name
        }
    }
}
