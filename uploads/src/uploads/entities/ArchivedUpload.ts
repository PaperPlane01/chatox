import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";
import {Upload} from "./Upload";
import {PartialBy} from "../../utils/types";

@Schema({collection: "archivedUploads"})
export class ArchivedUpload<MetadataType> extends Upload<MetadataType> {

    @Prop({type: mongoose.Schema.Types.Date})
    archivedAt: Date;

    constructor(upload: PartialBy<ArchivedUpload<MetadataType>, "id" | "isThumbnail" | "isPreview" | "thumbnails" | "scheduledDeletionDate" | "archivedAt">) {
        super(upload);

        if (!upload.archivedAt) {
            this.archivedAt = new Date();
        }
    }
}

export type ArchivedUploadDocument<MetadataType> = Document & ArchivedUpload<MetadataType>;

export const ArchivedUploadSchema = SchemaFactory.createForClass(ArchivedUpload);
