import {AsyncModelFactory} from "@nestjs/mongoose";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {Schema} from "mongoose";
import {UploadType} from "../entities";

const UploadSchema = new Schema({
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
    isThumbnail: Boolean,
    isPreview: Boolean,
    thumbnail: this,
    preview: this
});

export const uploadSchemaFactory: AsyncModelFactory = {
    name: "upload",
    useFactory: (amqpConnection: AmqpConnection) => {
        UploadSchema.post("save", async document => {
            await amqpConnection.publish(
                "upload.events",
                "upload.created.#",
                document
            );
        });
        return UploadSchema;
    },
    inject: [AmqpConnection]
};
