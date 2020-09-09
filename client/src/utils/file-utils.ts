import {v4 as uuid} from "uuid";
import {Upload} from "../api/types/response";
import {ApiError} from "../api";

export class UploadedFileContainer<UploadedFileMetadataType = any> {
    public url: string;

    constructor(
       public file: File,
       public pending: boolean = false,
       public uploadedFile: Upload<UploadedFileMetadataType> | undefined = undefined,
       public error: ApiError | undefined = undefined,
       public localId = uuid()

    ) {
        this.url = URL.createObjectURL(file);
    }
}
