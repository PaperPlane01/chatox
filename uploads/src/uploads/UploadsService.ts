import {CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import path from "path";
import {promises} from "fs";
import {Store} from "cache-manager";
import {addDays, addHours} from "date-fns";
import {Upload, UploadDocument, UploadType} from "./entities";
import {UploadMapper} from "./mappers";
import {UploadResponse} from "./types/responses";
import {UploadDeleted} from "./types/events";
import {UploadEventsPublisher} from "./events";
import {forEachAsync} from "../utils/for-each-async";
import {generateFileInfoCacheKey} from "../utils/cache-utils";
import {config} from "../config";
import {
    UploadDeletionReason,
    UploadDeletionReasonType,
    UploadReference,
    UploadReferenceDocument
} from "../upload-references/entities";

@Injectable()
export class UploadsService {
    private readonly log = new Logger(UploadsService.name);

    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                @InjectModel(UploadReference.name) private readonly uploadReferenceModel: Model<UploadReferenceDocument>,
                private readonly uploadMapper: UploadMapper,
                @Inject(CACHE_MANAGER) private readonly cacheManager: Store,
                private readonly uploadEventsPublisher: UploadEventsPublisher) {
    }

    public async getUploadInfo(uploadId: string): Promise<UploadResponse<any>> {
        const upload = await this.getUpload(uploadId);

        return this.uploadMapper.toUploadResponse(upload);
    }

    public async scheduleUploadForDeletion(uploadId: string): Promise<void> {
        const upload = await this.getUpload(uploadId);

        await this.uploadReferenceModel.updateMany({
            uploadId
        },
            {
                $set: {
                    scheduledForDeletion: true
                },
                $push: {
                    deletionReasons: new UploadDeletionReason({
                        deletionReasonType: UploadDeletionReasonType.DELETE_UPLOAD_REQUEST
                    })
                }
            }
        );

        const deletionReasons = (await this.uploadReferenceModel.find({uploadId}))
            .flatMap(uploadReference => uploadReference.deletionReasons);
        const uploadDeleted: UploadDeleted = {
            uploadId,
            uploadType: upload.type,
            deletionReasons
        };
        await this.uploadEventsPublisher.uploadDeleted(uploadDeleted);
        await this.scheduleUploadDocumentForDeletion(upload, addHours(new Date(), 4));
    }

    public async scheduleUploadDocumentForDeletion(upload: UploadDocument<any>, scheduledDate?: Date): Promise<void> {
        upload.scheduledDeletionDate = scheduledDate
            ? scheduledDate
            : addDays(new Date(), 1);
        await upload.save();
    }

    public async deleteUploadDocument(upload: UploadDocument<any>): Promise<void> {
        this.log.verbose(`Deleting upload ${upload.id}`);
        await this.deleteUploadFromDatabase(upload);
        await this.deleteUploadFromFileSystem(upload);
        await this.deleteUploadInfoFromCache(upload);
    }

    public async getUpload(uploadId: string): Promise<UploadDocument<any>> {
        const upload = await this.uploadModel.findOne({
            id: uploadId
        })
            .exec();

        if (!upload) {
            throw new HttpException(
                `Could not find upload with id ${uploadId}`,
                HttpStatus.NOT_FOUND
            )
        }

        return upload;
    }

    private async deleteUploadFromDatabase(upload: UploadDocument<any>): Promise<void> {
        this.log.verbose(`Deleting upload ${upload.id} from database`);
        await upload.deleteOne();

        await forEachAsync(
            upload.thumbnails,
            async thumbnail => await this.uploadModel.deleteOne({id: thumbnail.id})
        );

        if (upload.previewImage) {
            await this.uploadModel.deleteOne({id: upload.previewImage.id});
        }
    }

    private async deleteUploadFromFileSystem(upload: UploadDocument<any>): Promise<void> {
        let directory: string;

        switch (upload.type) {
            case UploadType.AUDIO:
                directory = config.AUDIOS_DIRECTORY;
                break;
            case UploadType.IMAGE:
            case UploadType.GIF:
                directory = config.IMAGES_DIRECTORY
                break;
            case UploadType.VIDEO:
                directory = config.VIDEOS_DIRECTORY;
                break;
            case UploadType.FILE:
            default:
                directory = config.FILES_DIRECTORY;
                break;
        }

       try {
           const uploadPath = path.join(directory, upload.name);

           await promises.unlink(uploadPath);

           await forEachAsync(
               upload.thumbnails,
               async thumbnail => await promises.unlink(path.join(config.IMAGES_THUMBNAILS_DIRECTORY, thumbnail.name))
           );

           if (upload.previewImage) {
               await promises.unlink(path.join(config.IMAGES_DIRECTORY, upload.previewImage.name));
           }
       } catch (error) {
            this.log.error(`Error occurred when tried to remove upload ${upload.id} from file system`);
            this.log.error(error.stack ? error.stack : error);
            throw error;
       }
    }

    private async deleteUploadInfoFromCache(upload: Upload<any>): Promise<void> {
        await this.cacheManager.del(generateFileInfoCacheKey(upload.name));

        await forEachAsync(
            upload.thumbnails,
            async thumbnail => await this.cacheManager.del(generateFileInfoCacheKey(upload.name, thumbnail.size))
        );
    }
}
