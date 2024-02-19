import {Injectable, Logger, OnApplicationBootstrap} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Cron, CronExpression} from "@nestjs/schedule";
import {Model} from "mongoose";
import {UploadDeletionReason, UploadReference, UploadReferenceDocument} from "./entities";
import {Upload, UploadDocument, UploadsService} from "../uploads";
import {filterAsync, forEachAsync, mapTo3Arrays} from "../utils/array-utils";
import {config} from "../config";
import {UploadDeleted} from "../uploads/types/events";
import {UploadEventsPublisher} from "../uploads/events";

@Injectable()
export class UploadReferenceDeletionChecker implements OnApplicationBootstrap {
    private readonly log = new Logger(UploadReferenceDeletionChecker.name);

    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>,
                @InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadsService: UploadsService,
                private readonly uploadEventsPublisher: UploadEventsPublisher) {
    }

    @Cron(CronExpression.EVERY_HOUR)
    public async checkForDeletableUploads(): Promise<void> {
        if (!config.ENABLE_SCHEDULED_UPLOAD_DELETION) {
            return;
        }

        this.log.log("Looking for upload references to delete")
        const uploadReferencesToDelete = await this.uploadReferenceModel.find({
            scheduledForDeletion: true
        });

        if (uploadReferencesToDelete.length === 0) {
            this.log.log("No upload references scheduled for deletion found");
            return;
        }

        const deletionReasonsMap = new Map<string, UploadDeletionReason[]>();
        const [uploadsIds, uploadReferencesIds] = mapTo3Arrays(
            uploadReferencesToDelete,
            uploadReference => uploadReference.uploadId,
            uploadReference => uploadReference._id,
            uploadReference => {
                if (deletionReasonsMap.has(uploadReference.uploadId)) {
                    deletionReasonsMap.get(uploadReference.uploadId).push(...uploadReference.deletionReasons);
                } else {
                    deletionReasonsMap.set(uploadReference.uploadId, uploadReference.deletionReasons);
                }
            }
        );
        this.log.log(`Found ${uploadReferencesIds.length} upload references scheduled for deletion`);

        const uploadsIdsToDelete = await filterAsync(
            uploadsIds,
            async uploadId => (await this.uploadReferenceModel.countDocuments({
                uploadId,
                _id: {
                    $nin: uploadReferencesIds
                }
            }) === 0)
        );

        const uploadsToDelete = await this.uploadModel.find({
            id: {
                $in: uploadsIdsToDelete
            },
            scheduledDeletionDate: null
        });
        this.log.log(`Found ${uploadsToDelete.length} uploads to delete`);

        await forEachAsync(
            uploadsToDelete,
            async upload => {
                const uploadDeleted: UploadDeleted = {
                    uploadId: upload.id,
                    deletionReasons: deletionReasonsMap.get(upload.id) || [],
                    uploadType: upload.type
                };
                await this.uploadEventsPublisher.uploadDeleted(uploadDeleted);
                await this.uploadsService.scheduleUploadDocumentForDeletion(upload);
            }
        );

        await this.uploadReferenceModel.deleteMany({
            _id: {
                $in: uploadReferencesIds
            }
        });
    }

    public onApplicationBootstrap(): void {
        this.checkForDeletableUploads();
    }
}