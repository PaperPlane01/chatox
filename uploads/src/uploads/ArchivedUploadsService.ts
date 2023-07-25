import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {promises as fileSystem} from "fs";
import path from "path";
import {Response} from "express";
import {ArchivedUpload, ArchivedUploadDocument, Upload, UploadDocument} from "./entities";
import {UploadResponse} from "./types/responses";
import {UploadMapper} from "./mappers";
import {config} from "../config";
import {streamFileToResponse} from "../utils/file-utils";

@Injectable()
export class ArchivedUploadsService {
    private readonly log = new Logger(ArchivedUploadsService.name);

    constructor(@InjectModel(ArchivedUpload.name) private readonly archivedUploadModel: Model<ArchivedUploadDocument<any>>,
                @InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadMapper: UploadMapper) {
    }

    public async archiveUpload(uploadId: string): Promise<UploadResponse<any>> {
        const upload = await this.uploadModel.findById(uploadId);

        if (!upload) {
            throw new HttpException(
                `Could not find upload with id ${uploadId}`,
                HttpStatus.NOT_FOUND
            )
        }

        if (!upload.scheduledDeletionDate) {
            throw new HttpException(
                "Cannot archive upload which was not scheduled for deletion",
                HttpStatus.FORBIDDEN
            );
        }

        const currentPath = path.join(config.getUploadDirectory(upload.type), upload.name);
        const newPath = path.join(config.ARCHIVED_FILES_DIRECTORY, upload.name);
        await fileSystem.copyFile(currentPath, newPath);

        const archivedUpload = new this.archivedUploadModel(new ArchivedUpload(upload));
        await archivedUpload.save();

        return this.uploadMapper.toUploadResponse(archivedUpload);
    }

    public async getArchivedUpload(uploadName: string, response: Response): Promise<void> {
        const upload = await this.archivedUploadModel.findOne({
            name: uploadName
        });

        if (!upload) {
            throw new HttpException(
                `Could not find archived upload with name ${uploadName}`,
                HttpStatus.NOT_FOUND
            );
        }

        response.setHeader("Cache-Control", "max-age=31536000");
        response.setHeader("Content-Type", upload.mimeType);

        const filePath = path.join(config.ARCHIVED_FILES_DIRECTORY, uploadName);

        await streamFileToResponse(filePath, response, this.log);
    }
}