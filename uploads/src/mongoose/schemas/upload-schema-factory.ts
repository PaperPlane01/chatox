import {AsyncModelFactory} from "@nestjs/mongoose";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {Schema} from "mongoose";
import {Upload, UploadType} from "../entities";

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

const getRabbitMQRoutingKey = (upload: Upload<any>): string => {
    switch (upload.type) {
        case UploadType.IMAGE:
            return "upload.image.created.#";
        case UploadType.GIF:
            return "upload.gif.created.#";
        case UploadType.VIDEO:
            return "upload.video.created.#";
         case UploadType.AUDIO:
             return "upload.audio.created.#";
        case UploadType.FILE:
             return "upload.file.created.#";

    }
};

export const uploadSchemaFactory: AsyncModelFactory = {
    name: "upload",
    useFactory: (amqpConnection: AmqpConnection) => {
        UploadSchema.post("save", async document => {
            await amqpConnection.publish(
                "upload.events",
                getRabbitMQRoutingKey(document as Upload<any>),
                document
            );
        });
        return UploadSchema;
    },
    inject: [AmqpConnection]
};
