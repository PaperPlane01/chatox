import {Injectable} from "@nestjs/common";
import {ArchivedUpload, Upload, UploadType} from "../entities";
import {UploadResponse} from "../types/responses";
import {config} from "../../config";

@Injectable()
export class UploadMapper {

    public toUploadResponse<Metadata>(upload: Upload<Metadata> | ArchivedUpload<Metadata>): UploadResponse<Metadata> {
        return new UploadResponse<Metadata>({
            id: upload.id,
            extension: upload.extension,
            meta: upload.meta,
            mimeType: upload.mimeType,
            originalName: upload.originalName,
            size: upload.size,
            type: upload.type,
            previewImage: upload.previewImage && this.toUploadResponse(upload.previewImage),
            thumbnails: upload.thumbnails.map(thumbnail => this.toUploadResponse(thumbnail)),
            name: upload.name,
            isPreview: upload.isPreview,
            isThumbnail: upload.isThumbnail,
            uri: this.getUploadUri(upload)
        });
    }

    private getUploadUri(upload: Upload<any> | ArchivedUpload<any>): string {
        const apiHost = config.API_HOST;

        if ((upload as ArchivedUpload<any>).archivedAt) {
            return `${apiHost}/api/v1/uploads/archived/${upload.name}`;
        }

        switch (upload.type) {
            case UploadType.AUDIO:
            case UploadType.VOICE_MESSAGE:
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