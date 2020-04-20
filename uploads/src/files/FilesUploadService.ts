import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import {createReadStream, promises as fileSystem} from "fs";
import path from "path";
import {fromFile} from "file-type";
import contentDisposition from "content-disposition";
import {Upload, UploadType} from "../mongoose/entities";
import {UploadMapper} from "../common/mappers";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {config} from "../config";

@Injectable()
export class FilesUploadService {
    constructor(@InjectModel("upload") private readonly uploadModel: Model<Upload<any>>,
                private readonly uploadMapper: UploadMapper) {

    }

    public async uploadFile(multipartFile: MultipartFile, originalName?: string): Promise<UploadInfoResponse<any>> {
        const id = new Types.ObjectId().toHexString();
        const temporaryFilePath = path.join(config.FILES_DIRECTORY, `${id}.tmp`);
        const fileHandle = await fileSystem.open(temporaryFilePath, "w");
        await fileSystem.writeFile(fileHandle, multipartFile.buffer);
        await fileHandle.close();

        const fileInfo = await fromFile(temporaryFilePath);
        const permanentFilePath = path.join(config.FILES_DIRECTORY, `${id}.${fileInfo.ext}`);
        await fileSystem.rename(temporaryFilePath, permanentFilePath);

        const file: Upload<any> = new this.uploadModel({
            id,
            name: `${id}.${fileInfo.ext}`,
            mimeType: fileInfo.mime,
            type: UploadType.FILE,
            meta: null,
            originalName: originalName ? originalName : multipartFile.originalname,
            size: multipartFile.size,
            extension: fileInfo.ext,
            isPreview: false,
            isThumbnail: false
        });
        await file.save();

        return this.uploadMapper.toUploadInfoResponse(file);
    }

    public async downloadFile(fileName: string, response: Response): Promise<void> {
        const file = await this.uploadModel.findOne({
            name: fileName
        });

        if (!file) {
            throw new HttpException(
                `Could not find file with name ${fileName}`,
                HttpStatus.NOT_FOUND
            );
        }

        const contentDispositionHeader = contentDisposition(file.originalName);
        response.header("Content-Disposition", contentDispositionHeader);
        response.header("Content-Type", file.mimeType);
        const filePath = path.join(config.FILES_DIRECTORY, file.name);
        createReadStream(filePath).pipe(response);
    }
}
