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
import {ExternalUser, UserDeleted} from "../../external/types";

@Injectable()
export class UploadReferenceUsersEventsListener {
    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>) {
    }

    @RabbitSubscribe({
        exchange: "user.events",
        queue: "upload_service_user_created",
        routingKey: "user.created.#"
    })
    public async onUserCreated(user: ExternalUser): Promise<void> {
        if (!user.avatar) {
            return;
        }

        const uploadReference = new UploadReference({
            referenceObjectId: user.id,
            uploadId: user.avatar.id,
            type: UploadReferenceType.USER_PROFILE_IMAGE
        });
        await new this.uploadReferenceModel(uploadReference).save();
    }

    @RabbitSubscribe({
        exchange: "user.events",
        queue: "upload_service_user_updated",
        routingKey: "user.updated.#"
    })
    public async onUserUpdated(user: ExternalUser): Promise<void> {
        const existingReference = await this.uploadReferenceModel.findOne({
            referenceObjectId: user.id,
            type: UploadReferenceType.USER_PROFILE_IMAGE,
            scheduledForDeletion: false
        });

        if (!existingReference && !user.avatar) {
            return;
        }

        if (existingReference && user.avatar && existingReference.uploadId === user.avatar.id) {
            return;
        }


        if (existingReference && user.avatar?.id !== existingReference.uploadId) {
            existingReference.scheduledForDeletion = true;
            existingReference.deletionReasons.push(new UploadDeletionReason({
                deletionReasonType: UploadDeletionReasonType.USER_UPDATED_EVENT,
                sourceObjectId: user.id
            }))
            await existingReference.updateOne();
        }

        if (!user.avatar) {
            return;
        }

        const uploadReference = new UploadReference({
            referenceObjectId: user.id,
            uploadId: user.avatar.id,
            type: UploadReferenceType.USER_PROFILE_IMAGE
        });
        await new this.uploadReferenceModel(uploadReference).save();
    }

    @RabbitSubscribe({
        exchange: "user.events",
        queue: "upload_service_user_deleted",
        routingKey: "user.deleted.#"
    })
    public async onUserDeleted(userDeleted: UserDeleted): Promise<void> {
        await this.uploadReferenceModel.updateMany(
            {
                referenceObjectId: userDeleted.id,
                type: UploadReferenceType.USER_PROFILE_IMAGE
            },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionReasons: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.USER_DELETED_EVENT,
                        sourceObjectId: userDeleted.id
                    })
                }
            }
        );
    }
}