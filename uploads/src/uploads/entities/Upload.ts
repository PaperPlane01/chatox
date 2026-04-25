import {AsyncModelFactory, Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import * as mongoose from "mongoose";
import {UploadType} from "./UploadType";
import {ImageUploadMetadata} from "./ImageUploadMetadata";
import {ThumbnailMetadata} from "./ThumbnailMetadata";
import {UploadMapper} from "../mappers";
import {PartialBy} from "../../utils/types";

@Schema({collection: "uploads"})
export class Upload<UploadMetadata> {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id = new mongoose.Types.ObjectId();

    //legacy property, do not assign
    @Prop()
    id: string;

    @Prop()
    size: number;

    @Prop()
    name: string;

    @Prop()
    originalName: string;

    @Prop()
    extension: string;

    @Prop()
    mimeType: string;

    @Prop()
    userId?: string;

    @Prop({
        enum: [
            UploadType.IMAGE,
            UploadType.GIF,
            UploadType.FILE,
            UploadType.AUDIO,
            UploadType.VOICE_MESSAGE,
            UploadType.VIDEO,
            UploadType.IMAGE_STICKER,
            UploadType.WEBP_STICKER,
            UploadType.VIDEO_STICKER,
            UploadType.LOTTIE_STICKER
        ]
    })
    type: UploadType;

    @Prop({type: mongoose.Schema.Types.Mixed})
    meta?: UploadMetadata;

    @Prop({type: mongoose.Schema.Types.Mixed})
    previewImage?: Upload<ImageUploadMetadata>;

    @Prop({type: [mongoose.Schema.Types.Mixed]})
    thumbnails: Upload<ThumbnailMetadata>[];

    @Prop()
    isThumbnail: boolean;

    @Prop()
    isPreview: boolean;

    @Prop()
    originalId?: string;

    @Prop({type: mongoose.Schema.Types.Date})
    scheduledDeletionDate?: Date;

    constructor(upload: PartialBy<Upload<UploadMetadata>, "id" | "isThumbnail" | "isPreview" | "thumbnails" | "scheduledDeletionDate">) {
        Object.assign(this, upload);

        this.id = this._id.toHexString();
        this.isThumbnail = Boolean(upload.isThumbnail);
        this.isPreview = Boolean(upload.isPreview);
        this.thumbnails = upload.thumbnails || [];
    }
}

export type UploadDocument<UploadMetadataType> = Upload<UploadMetadataType> & mongoose.Document;

const UploadSchema = SchemaFactory.createForClass(Upload);

const getUploadCreatedRabbitMQRoutingKey = (upload: Upload<any>): string => {
    switch (upload.type) {
        case UploadType.IMAGE:
            return "upload.image.created.#";
        case UploadType.GIF:
            return "upload.gif.created.#";
        case UploadType.VIDEO:
            return "upload.video.created.#";
        case UploadType.AUDIO:
            return "upload.audio.created.#";
        case UploadType.VOICE_MESSAGE:
            return "upload.voice.message.created.#";
        case UploadType.FILE:
            return "upload.file.created.#";
        case UploadType.IMAGE_STICKER:
            return "upload.sticker.image.created.#";
        case UploadType.WEBP_STICKER:
            return "upload.sticker.webp.created.#";
        case UploadType.LOTTIE_STICKER:
            return "upload.sticker.lottie.created.#";
        case UploadType.VIDEO_STICKER:
            return "upload.sticker.video.created.#";
    }
};

export const uploadSchemaFactory: AsyncModelFactory = {
    name: Upload.name,
    inject: [AmqpConnection],
    useFactory: (amqpConnection: AmqpConnection) => {
        const schema = UploadSchema;

        //TODO: Inject via dependency injection
        const uploadMapper = new UploadMapper();

        schema.post("save", async document => {
            await amqpConnection.publish(
                "upload.events",
                getUploadCreatedRabbitMQRoutingKey(document as UploadDocument<any>),
                uploadMapper.toUploadResponse(document as UploadDocument<any>)
            );
        });

        return schema;
    }
};
