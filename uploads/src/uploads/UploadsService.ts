import {CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import path from "path";
import {promises} from "fs";
import {Store} from "cache-manager";
import {Upload, UploadDocument, UploadType} from "./entities";
import {UploadMapper} from "./mappers";
import {UploadResponse} from "./types/responses";
import {forEachAsync} from "../utils/for-each-async";
import {generateFileInfoCacheKey} from "../utils/cache-utils";
import {config} from "../config";

@Injectable()
export class UploadsService {
    private readonly log = new Logger(UploadsService.name);

    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadMapper: UploadMapper,
                @Inject(CACHE_MANAGER) private readonly cacheManager: Store) {
    }

    public async getUploadInfo(uploadId: string): Promise<UploadResponse<any>> {
        const upload = await this.getUpload(uploadId);

        return this.uploadMapper.toUploadResponse(upload);
    }

    public async deleteUpload(uploadId: string): Promise<void> {
        const upload = await this.getUpload(uploadId);
        await this.deleteUploadDocument(upload);
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

        const uploadPath = path.join(directory, upload.name);

        await promises.unlink(uploadPath);

        await forEachAsync(
            upload.thumbnails,
            async thumbnail => await promises.unlink(path.join(config.IMAGES_DIRECTORY, thumbnail.name))
        );

        if (upload.previewImage) {
            await promises.unlink(path.join(config.IMAGES_DIRECTORY, upload.previewImage.name));
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
