import {Schema} from "mongoose";

export const UploadSchema = new Schema({
    id: String,
    extension: String,
    mimeType: String,
    userId: String,
    size: Number,
    originalName: String,
    name: String,
    meta: Schema.Types.Mixed,
    thumbnail: this
});
