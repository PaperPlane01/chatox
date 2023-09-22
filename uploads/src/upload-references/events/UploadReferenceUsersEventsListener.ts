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
import {UserDeleted, UserProfilePhotoCreated, UserProfilePhotoDeleted} from "../../external/types";

@Injectable()
export class UploadReferenceUsersEventsListener {
    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>) {
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

    @RabbitSubscribe({
        exchange: "user.events",
        queue: "upload_service_user_profile_photo_created",
        routingKey: "user.photo.created.#"
    })
    public async onUserProfilePhotoCreated(userProfilePhotoCreated: UserProfilePhotoCreated): Promise<void> {
        const existingReference = await this.uploadReferenceModel.findOne({
            referenceObjectId: userProfilePhotoCreated.id,
            uploadId: userProfilePhotoCreated.upload.id,
            type: UploadReferenceType.USER_PROFILE_IMAGE
        });

        if (existingReference) {
            return;
        }

        const uploadReference = new UploadReference({
            referenceObjectId: userProfilePhotoCreated.id,
            uploadId: userProfilePhotoCreated.upload.id,
            type: UploadReferenceType.USER_PROFILE_IMAGE
        });
        await new this.uploadReferenceModel(uploadReference).save();
    }

    @RabbitSubscribe({
        exchange: "user.events",
        queue: "upload_service_user_profile_photo_deleted",
        routingKey: "user.photo.deleted.#"
    })
    public async onUserProfilePhotoDeleted(userProfilePhotoDeleted: UserProfilePhotoDeleted): Promise<void> {
        await this.uploadReferenceModel.updateOne(
            {
                referenceObjectId: userProfilePhotoDeleted.id,
                type: UploadReferenceType.USER_PROFILE_IMAGE,
                uploadId: userProfilePhotoDeleted.upload.id
            },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionReasons: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.USER_PROFILE_PHOTO_DELETED_EVENT,
                        sourceObjectId: userProfilePhotoDeleted.id
                    })
                }
            }
        );
    }
}