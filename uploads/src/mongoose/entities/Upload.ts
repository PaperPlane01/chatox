import {Document} from "mongoose";
import {UploadType} from "./UploadType";

export interface Upload<Metadata> extends Document {
    id: string,
    size: number,
    name: string,
    originalName: string,
    extension: string,
    mimeType: string,
    userId?: string,
    type: UploadType,
    meta: Metadata,
    thumbnail?: Upload<Metadata>
}
