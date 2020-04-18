import {Schema} from "mongoose";
import {UploadType} from "../entities";

export const UploadSchema = new Schema({
    id: String,
    extension: String,
    mimeType: String,
    userId: String,
    size: Number,
    originalName: String,
    name: String,
    meta: Schema.Types.Mixed,
    type: {
        type: String,
        enum: [
            UploadType.IMAGE,
            UploadType.GIF,
            UploadType.FILE,
            UploadType.VIDEO,
            UploadType.AUDIO
        ]
    },
    thumbnail: this,
    preview: this
});
