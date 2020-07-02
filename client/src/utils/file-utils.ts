import {v4 as uuid} from "uuid";
import {Upload} from "../api/types/response";

export class UploadedFileContainer<UploadedFileMetadataType> {
    public url: string;

    constructor(
       public file: File,
       public localId = uuid(),
       public pending: boolean = false,
       public uploadedFile: Upload<UploadedFileMetadataType> | undefined = undefined,

    ) {
        this.url = URL.createObjectURL(file);
    }
}
