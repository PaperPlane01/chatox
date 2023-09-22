import {v4 as uuid} from "uuid";
import {Upload, UploadType} from "../api/types/response";
import {ApiError} from "../api";
import {makeAutoObservable} from "mobx";

export class UploadedFileContainer<UploadedFileMetadataType = any> {
    public url: string;

    constructor(
       public file: File | null | undefined,
       public expectedUploadType: UploadType,
       public pending: boolean = false,
       public localId = uuid(),
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

    public copy(newFields: Partial<UploadedFileContainer>): UploadedFileContainer<UploadedFileMetadataType> {
        return new UploadedFileContainer<UploadedFileMetadataType>(
            newFields.file || this.file,
            newFields.expectedUploadType || this.expectedUploadType,
            newFields.pending || this.pending,
            newFields.localId || this.localId,
            newFields.uploadedFile || this.uploadedFile,
        newFields.uploadPercentage || this.uploadPercentage,
            newFields.error || this.error
        );
    }
}
