import {Injectable, Logger, OnApplicationBootstrap} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Cron, CronExpression} from "@nestjs/schedule";
import {Model} from "mongoose";
import {Upload, UploadDocument} from "./entities";
import {UploadsService} from "./UploadsService";
import {forEachAsync} from "../utils/for-each-async";
import {config} from "../config";

@Injectable()
export class UploadDeletionChecker implements OnApplicationBootstrap {
    private readonly log = new Logger(UploadDeletionChecker.name);

    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadService: UploadsService) {
    }

    @Cron(CronExpression.EVERY_HOUR)
    public async checkUploadsScheduledForDeletion(): Promise<void> {
        if (!config.ENABLE_SCHEDULED_UPLOAD_DELETION) {
            return;
        }

        this.log.log("Checking for uploads to delete");
        const uploadsToDelete = await this.uploadModel.find({
            scheduledDeletionDate: {
                $lte: new Date()
            }
        });
        this.log.log(`${uploadsToDelete.length} uploads will be deleted`);
        await forEachAsync(
            uploadsToDelete,
            async upload => await this.uploadService.deleteUploadDocument(upload)
        );
    }

    public onApplicationBootstrap(): any {
        this.checkUploadsScheduledForDeletion();
    }
}