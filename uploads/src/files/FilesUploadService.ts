import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import {createReadStream, promises as fileSystem} from "fs";
import path from "path";
import {fromFile} from "file-type";
import contentDisposition from "content-disposition";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {Upload, UploadDocument, UploadType} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {UploadResponse} from "../uploads/types/responses";
import {User} from "../auth";

@Injectable()
export class FilesUploadService {
    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<any>>,
                private readonly uploadMapper: UploadMapper) {

    }

    public async uploadFile(multipartFile: MultipartFile, currentUser: User, originalName?: string): Promise<UploadResponse<any>> {
        const id = new Types.ObjectId();
        const temporaryFilePath = path.join(config.FILES_DIRECTORY, `${id.toHexString()}.tmp`);
        const fileHandle = await fileSystem.open(temporaryFilePath, "w");
        await fileSystem.writeFile(fileHandle, multipartFile.buffer);
        await fileHandle.close();

        const fileInfo = await fromFile(temporaryFilePath);
        const permanentFilePath = path.join(config.FILES_DIRECTORY, `${id}.${fileInfo.ext}`);
        await fileSystem.rename(temporaryFilePath, permanentFilePath);

        const file = new Upload({
            _id: id,
            name: `${id.toHexString()}.${fileInfo.ext}`,
            mimeType: fileInfo.mime,
            type: UploadType.FILE,
            meta: null,
            originalName: originalName ? originalName : multipartFile.originalname,
            size: multipartFile.size,
            extension: fileInfo.ext,
            isPreview: false,
            isThumbnail: false,
            userId: currentUser.id
        });
        await new this.uploadModel(file).save();

        return this.uploadMapper.toUploadResponse(file);
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
        response.setHeader("Content-Disposition", contentDispositionHeader);
        response.setHeader("Content-Type", file.mimeType);
        response.setHeader("Content-Length", file.size);
        const filePath = path.join(config.FILES_DIRECTORY, file.name);
        createReadStream(filePath).pipe(response);
    }
}
