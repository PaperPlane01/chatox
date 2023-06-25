import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {UploadReferenceType} from "./UploadReferenceType";
import {PartialBy} from "../../utils/types";
import {UploadDeletionReason} from "./UploadDeletionReason";

@Schema({collection: "uploadReferences"})
export class UploadReference {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id = new mongoose.Types.ObjectId();

    @Prop()
    uploadId: string;

    @Prop()
    referenceObjectId: string;

    @Prop({
        enum: [
            UploadReferenceType.CHAT_PROFILE_IMAGE,
            UploadReferenceType.MESSAGE_ATTACHMENT,
            UploadReferenceType.USER_PROFILE_IMAGE,
            UploadReferenceType.STICKER
        ]
    })
    type: UploadReferenceType;

    @Prop()
    createdAt: Date = new Date();
    
    @Prop()
    scheduledForDeletion: boolean = false;

    @Prop({type: mongoose.Schema.Types.Array})
    deletionReasons: UploadDeletionReason[] = [];

    constructor(uploadReference: PartialBy<UploadReference, "_id" | "createdAt" | "scheduledForDeletion" | "deletionReasons">) {
        Object.assign(this, uploadReference);
    }
}

export type UploadReferenceDocument = UploadReference & mongoose.Document;

export const UploadReferenceSchema = SchemaFactory.createForClass(UploadReference);
