import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {Model} from "mongoose";
import {UploadDeletionReasonType, UploadReference, UploadReferenceDocument, UploadReferenceType} from "../entities";
import {Chat, ChatDeleted} from "../../external/types";
import {UploadDeletionReason} from "../entities/UploadDeletionReason";

@Injectable()
export class UploadReferenceChatsEventsListener {
    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_chat_created",
        routingKey: "chat.created.#"
    })
    public async onChatCreated(chat: Chat): Promise<void> {
        if (!chat.avatar) {
            return;
        }

        const uploadReference = new UploadReference({
            type: UploadReferenceType.CHAT_PROFILE_IMAGE,
            referenceObjectId: chat.id,
            uploadId: chat.avatar.id
        });
        await new this.uploadReferenceModel(uploadReference).save();
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_chat_updated",
        routingKey: "chat.updated.#"
    })
    public async onChatUpdated(chat: Chat): Promise<void> {
        const existingUploadReference = await this.uploadReferenceModel.findOne({
            referenceObjectId: chat.id,
            type: UploadReferenceType.CHAT_PROFILE_IMAGE
        });

        if (!chat.avatar && !existingUploadReference) {
            return;
        }

        if (chat.avatar && existingUploadReference && chat.avatar.id === existingUploadReference.uploadId) {
            return;
        }

        if (!chat.avatar && existingUploadReference) {
            await this.uploadReferenceModel.updateOne(
                {
                    _id: existingUploadReference.id
                },
                {
                    $set: {
                        scheduledForDeletion: true
                    },
                    $push: {
                        deletionReasons: new UploadDeletionReason({
                            deletionReasonType: UploadDeletionReasonType.CHAT_UPDATED_EVENT
                        })
                    }
                }
            );
            return;
        }

        const uploadReference = new UploadReference({
            referenceObjectId: chat.id,
            uploadId: chat.avatar.id,
            type: UploadReferenceType.CHAT_PROFILE_IMAGE
        });
        await new this.uploadReferenceModel(uploadReference).save();

        if (existingUploadReference) {
            this.uploadReferenceModel.updateOne(
                {
                    referenceObjectId: chat.id,
                    type: UploadReferenceType.CHAT_PROFILE_IMAGE
                },
                {
                    $set: {
                        scheduledForDeletion: true
                    },
                    $push: {
                        deletionReasons: new UploadDeletionReason({
                            deletionReasonType: UploadDeletionReasonType.CHAT_UPDATED_EVENT
                        })
                    }
                }
            );
        }
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "upload_service_chat_deleted",
        routingKey: "chat.deleted.#"
    })
    public async onChatDeleted(chatDeleted: ChatDeleted): Promise<void> {
        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: chatDeleted.id,
                type: UploadReferenceType.CHAT_PROFILE_IMAGE
            },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionSources: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.CHAT_DELETED_EVENT,
                        sourceObjectId: chatDeleted.id
                    })
                }
            }
        );
    }
}