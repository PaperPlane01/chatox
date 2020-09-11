import {v4 as uuid} from "uuid";
import {Upload} from "../api/types/response";
import {ApiError} from "../api";
import {UploadType} from "../api/types/response/UploadType";

export class UploadedFileContainer<UploadedFileMetadataType = any> {
    public url: string;

    constructor(
       public file: File,
       public expectedUploadType: UploadType,
       public pending: boolean = false,
       public uploadPercentage: number = 0,
       public uploadedFile: Upload<UploadedFileMetadataType> | undefined = undefined,
       public localId = uuid(),
       public error: ApiError | undefined = undefined,
    ) {
        this.url = URL.createObjectURL(file);
    }

    public copy(newFields: Partial<UploadedFileContainer>): UploadedFileContainer<UploadedFileMetadataType> {
        return new UploadedFileContainer<UploadedFileMetadataType>(
            newFields.file || this.file,
            newFields.expectedUploadType || this.expectedUploadType,
            newFields.pending || this.pending,
            newFields.uploadPercentage || this.uploadPercentage,
            newFields.uploadedFile || this.uploadedFile,
            newFields.localId || this.localId,
            newFields.error || this.error
        )
    }
}
