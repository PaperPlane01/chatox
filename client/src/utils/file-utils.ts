import {v4 as uuid} from "uuid";
import {makeAutoObservable} from "mobx";
import {ApiError} from "../api";
import {
    AudioUploadMetadata,
    GifUploadMetadata,
    ImageUploadMetadata,
    Upload,
    UploadType,
    VideoUploadMetadata
} from "../api/types/response";

export class UploadedFileContainer<UploadedFileMetadataType = any> {
    public url: string;

    constructor(
       public file: File | null | undefined,
       public expectedUploadType: UploadType,
       public pending: boolean = false,
       public localId: string = uuid(),
       public uploadedFile: Upload<UploadedFileMetadataType> | undefined = undefined,
       public uploadPercentage: number = 0,
       public error: ApiError | undefined = undefined) {
        if (file) {
            this.url = URL.createObjectURL(file);
        } else if (uploadedFile) {
            this.url = uploadedFile.uri;
        } else {
            throw new Error("Creating UploadedFileContainer without both file and uploadedFile parameters is not allowed!")
        }

        makeAutoObservable(this);
    }

    public toUpload(): Upload<UploadedFileMetadataType> {
        if (this.uploadedFile) {
            if (this.localId) {
                this.uploadedFile.localId = this.localId;
            }

            return this.uploadedFile;
        }

        return {
            id: this.localId,
            uri: this.url ?? "",
            extension: this.file?.name?.substring(this.file?.name.indexOf(".")) ?? "",
            mimeType: "",
            name: this.file?.name ?? "",
            type: this.expectedUploadType,
            size: this.file?.size ?? 0,
            originalName: this.file?.name ?? "",
            isPreview: false,
            isThumbnail: false,
            meta: this.createStubMeta(this.expectedUploadType) as UploadedFileMetadataType,
            local: true,
            localId: this.localId
        };
    }

    private createStubMeta(uploadType: UploadType): ImageUploadMetadata | AudioUploadMetadata | GifUploadMetadata | VideoUploadMetadata | {} {
        if (uploadType === UploadType.IMAGE) {
            return {
                width: -1,
                height: -1
            };
        } else if (uploadType === UploadType.GIF) {
            return {
                width: -1,
                height: -1,
                duration: -1,
                durationChrome: -1,
                durationFirefox: -1,
                durationIE: -1,
                durationOpera: -1,
                durationSafari: -1,
                animated: true,
                infinite: false,
                loopCount: -1
            };
        } else if (uploadType === UploadType.AUDIO || uploadType === UploadType.VOICE_MESSAGE) {
            return {
                duration: -1,
                bitrate: -1,
                waveForm: undefined
            };
        } else if (uploadType === UploadType.VIDEO) {
            return {
                duration: -1,
                width: -1,
                height: -1
            };
        } else {
            return {};
        }
    }
}
