import {Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Cron, CronExpression} from "@nestjs/schedule";
import {Model} from "mongoose";
import {UploadReference, UploadReferenceDocument} from "./entities";
import {Upload, UploadDocument, UploadsService} from "../uploads";
import {mapTo2Arrays, filterAsync, forEachAsync} from "../utils/array-utils";
import {config} from "../config";

@Injectable()
export class UploadReferenceDeletionChecker {
    private readonly log = new Logger(UploadReferenceDeletionChecker.name);

    constructor(@InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>,
                @InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadsService: UploadsService) {
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

        const [uploadsIds, uploadReferencesIds] = mapTo2Arrays(
            uploadReferencesToDelete,
            uploadReference => uploadReference.uploadId,
            uploadReference => uploadReference._id
        );
        this.log.log(`Found ${uploadReferencesIds.length} upload references scheduled for deletion`);

        const uploadsIdsToDelete = await filterAsync(
            uploadsIds,
            async uploadId => (await this.uploadReferenceModel.count({
                uploadId,
                _id: {
                    $nin: uploadReferencesIds
                }
            }) === 0)
        );

        const uploadsToDelete = await this.uploadModel.find({
            id: {
                $in: uploadsIdsToDelete
            }
        });
        this.log.log(`Found ${uploadsToDelete.length} uploads to delete`);

        await forEachAsync(
            uploadsToDelete,
            async upload => await this.uploadsService.deleteUploadDocument(upload)
        );

        await this.uploadReferenceModel.deleteMany({
            _id: {
                $in: uploadReferencesIds
            }
        });
    }
}