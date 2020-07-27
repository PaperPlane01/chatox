import {Upload, UploadType} from "../../mongoose/entities";
import {UploadInfoResponse} from "../types/response";
import {config} from "../../config";

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
            isThumbnail: upload.isThumbnail,
            uri: this.getUploadUri(upload)
        }
    }

    private getUploadUri(upload: Upload<any>): string {
        const apiHost = config.API_HOST;

        switch (upload.type) {
            case UploadType.AUDIO:
                return `${apiHost}/api/v1/uploads/audios/${upload.name}`;
            case UploadType.FILE:
                return `${apiHost}/api/v1/uploads/files/${upload.name}`;
            case UploadType.VIDEO:
                return `${apiHost}/api/v1/uploads/videos/${upload.name}`;
            default:
                return `${apiHost}/api/v1/uploads/images/${upload.name}`;
        }
    }
}
