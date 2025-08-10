import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {Model} from "mongoose";
import {
    UploadDeletionReason,
    UploadDeletionReasonType,
    UploadReference,
    UploadReferenceDocument,
    UploadReferenceType
} from "../entities";
import {StickerPack, StickerPackUpdated} from "../../external/types";

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
                uploadId: sticker.upload.id,
                referenceObjectId: sticker.id,
                type: UploadReferenceType.STICKER
            })
        ));
        await this.uploadReferenceModel.bulkSave(uploadReferences);
    }

    @RabbitSubscribe({
        exchange: "sticker.events",
        queue: "upload_service_sticker_pack_updated",
        routingKey: "sticker.pack.updated.#"
    })
    public async onStickerPackUpdated(stickerPackUpdated: StickerPackUpdated): Promise<void> {
        const uploadReferences = stickerPackUpdated.newStickers.map(sticker => new this.uploadReferenceModel({
            uploadId: sticker.upload.id,
            referenceObjectId: sticker.id,
            type: UploadReferenceType.STICKER
        }));
        await this.uploadReferenceModel.bulkSave(uploadReferences);

        if (stickerPackUpdated.removedStickers.length === 0) {
            return;
        }

        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: {
                    $in: stickerPackUpdated.removedStickers.map(sticker => sticker.id)
                },
                type: UploadReferenceType.STICKER
            },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionReasons: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.STICKER_PACK_UPDATED_EVENT,
                        sourceObjectId: stickerPackUpdated.stickerPack.id
                    })
                }
            }
        );
    }

    @RabbitSubscribe({
        exchange: "sticker.events",
        queue: "upload_service_sticker_pack_deleted",
        routingKey: "sticker.pack.deleted.#"
    })
    public async onStickerPackDeleted(stickerPack: StickerPack): Promise<void> {
        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: {
                    $in: stickerPack.stickers.map(sticker => sticker.id)
                },
                type: UploadReferenceType.STICKER
            },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionReasons: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.STICKER_PACK_DELETED_EVENT,
                        sourceObjectId: stickerPack.id
                    })
                }
            }
        );
    }
}