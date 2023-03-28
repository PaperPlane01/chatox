import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {UploadReference, UploadReferenceDocument, UploadReferenceType} from "../entities";
import {Message, MessageDeleted, MessagesDeleted} from "../../external/types";

@Injectable()
export class UploadReferenceMessagesEventsListener {
    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_message_created",
        routingKey: "chat.message.created.#"
    })
    public async onMessageCreated(message: Message): Promise<void> {
        if (message.attachments.length === 0) {
            return;
        }

        const uploadReferences = message.attachments.map(attachment => new UploadReference({
            referenceObjectId: message.id,
            uploadId: attachment.id,
            type: UploadReferenceType.MESSAGE_ATTACHMENT
        }))
            .map(uploadReference => new this.uploadReferenceModel(uploadReference));

        await this.uploadReferenceModel.bulkSave(uploadReferences);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_message_updated",
        routingKey: "chat.message.updated.#"
    })
    public async onMessageUpdated(message: Message): Promise<void> {
        const existingReferencesUploadsIds = (await this.uploadReferenceModel.find({
            referenceObjectId: message.id,
            type: UploadReferenceType.MESSAGE_ATTACHMENT
        }))
            .map(reference => reference.uploadId);

        if (existingReferencesUploadsIds.length === 0 && message.attachments.length === 0) {
            return;
        }

        const messageAttachmentsIds = message.attachments.map(attachment => attachment.id);
        const referencesToRemove = existingReferencesUploadsIds
            .filter(referenceUploadId => !messageAttachmentsIds.includes(referenceUploadId));
        const newReferences = messageAttachmentsIds
            .filter(attachmentId => !existingReferencesUploadsIds.includes(attachmentId))
            .map(attachmentId => new this.uploadReferenceModel(new UploadReference({
                uploadId: attachmentId,
                referenceObjectId: message.id,
                type: UploadReferenceType.MESSAGE_ATTACHMENT
            })));

        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: message.id,
                uploadId: {
                    $in: referencesToRemove
                },
                type: UploadReferenceType.MESSAGE_ATTACHMENT
            },
            {
                $set: {
                    scheduledForDeletion: true
                }
            }
        );
        await this.uploadReferenceModel.bulkSave(newReferences);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_message_deleted",
        routingKey: "chat.message.deleted.#"
    })
    public async onMessageDeleted(messageDeleted: MessageDeleted): Promise<void> {
        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: messageDeleted.messageId,
                type: UploadReferenceType.MESSAGE_ATTACHMENT
            },
            {
                $set: {
                    scheduledForDeletion: true
                }
            }
        );
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "uploads_service_messages_deleted",
        routingKey: "chat.messages.deleted.#"
    })
    public async onMessagesDeleted(messagesDeleted: MessagesDeleted): Promise<void> {
        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: {
                    $in: messagesDeleted.messagesIds
                },
                type: UploadReferenceType.MESSAGE_ATTACHMENT
            },
            {
                $set: {
                    scheduledForDeletion: true
                }
            }
        );
    }
}