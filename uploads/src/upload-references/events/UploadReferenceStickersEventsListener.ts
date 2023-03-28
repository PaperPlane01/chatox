import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {Model} from "mongoose";
import {UploadReference, UploadReferenceDocument, UploadReferenceType} from "../entities";
import {StickerPack} from "../../external/types";

@Injectable()
export class UploadReferenceStickersEventsListener {
    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>) {
    }

    @RabbitSubscribe({
        exchange: "sticker.events",
        queue: "upload_service_sticker_pack_created",
        routingKey: "sticker.pack.created.#"
    })
    public async onStickerPackCreated(stickerPack: StickerPack): Promise<void> {
        const uploadReferences = stickerPack.stickers.map(sticker => new this.uploadReferenceModel(
            new UploadReference({
                uploadId: sticker.image.id,
                referenceObjectId: sticker.id,
                type: UploadReferenceType.STICKER
            })
        ));
        await this.uploadReferenceModel.bulkSave(uploadReferences);
    }
}