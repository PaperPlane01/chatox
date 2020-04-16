import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import graphicsMagic, {Dimensions} from "gm";
import fileSystem from "fs";
import path from "path";
import {FileTypeResult, fromFile} from "file-type";
import {GifUploadMetadata, ImageUploadMetadata, Upload, UploadType} from "../mongoose/entities";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {config} from "../config";
import {UploadMapper} from "../common/mappers";

const gm = graphicsMagic.subClass({imageMagick: true});

interface SaveImageOptions {
    fileId: string,
    filePath: string,
    fileInfo: FileTypeResult,
    multipartFile: MultipartFile
}

@Injectable()
export class ImagesUploadService {
    constructor(@InjectModel("upload") private readonly uploadModel: Model<Upload<ImageUploadMetadata | GifUploadMetadata>>,
                private readonly uploadMapper: UploadMapper) {}

    public async uploadImage(multipartFile: MultipartFile): Promise<UploadInfoResponse<ImageUploadMetadata | GifUploadMetadata>> {
        return new Promise<UploadInfoResponse<ImageUploadMetadata | GifUploadMetadata>>(async (resolve, reject) => {
            const id = new Types.ObjectId().toHexString();
            const temporaryFilePath = path.join(config.IMAGES_DIRECTORY, `${id}.tmp`);
            const fileDescriptor = fileSystem.openSync(temporaryFilePath, "w");
            fileSystem.writeSync(fileDescriptor, multipartFile.buffer);
            fileSystem.closeSync(fileDescriptor);

            const fileInfo = await fromFile(temporaryFilePath);

            if (fileInfo.mime.startsWith("image")) {
                if (fileInfo.ext !== "gif") {
                    resolve(this.saveImage({
                        fileId: id,
                        fileInfo,
                        filePath: temporaryFilePath,
                        multipartFile
                    }))
                }
            }
        })
    }

    private async saveImage(options: SaveImageOptions): Promise<UploadInfoResponse<ImageUploadMetadata>> {
       const imageDimensions = await this.getImageDimensions(options.filePath);
       const imageThumbnail = await this.generateThumbnail(options.filePath, options.fileInfo);

       const permanentPath = path.join(config.IMAGES_DIRECTORY, `${options.fileId}.${options.fileInfo.ext}`);
       fileSystem.renameSync(options.filePath, permanentPath);

       const image: Upload<ImageUploadMetadata> = new this.uploadModel({
           id: options.fileId,
           name: `${options.fileId}.${options.fileInfo.ext}`,
           mimeType: options.fileInfo.mime,
           extension: options.fileInfo.ext,
           meta: {
               width: imageDimensions.width,
               height: imageDimensions.height,
               thumbnailId: imageThumbnail.id
           },
           originalName: options.multipartFile.originalname,
           type: UploadType.IMAGE,
           size: options.multipartFile.size,
           thumbnail: imageThumbnail
       });
       await image.save();
       return this.uploadMapper.toUploadInfoResponse(image);
    }

    private getImageDimensions(filePath: string): Promise<Dimensions> {
        return new Promise<Dimensions>((resolve, reject) => {
            gm(filePath)
                .size((error, dimensions) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(dimensions);
                })
        })
    }

    private generateThumbnail(originalImagePath: string, originalImageInfo: FileTypeResult): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>(async (resolve, reject) => {
            const id = new Types.ObjectId().toHexString();
            const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${id}.${originalImageInfo.ext}`);
            gm(originalImagePath).resize(200)
                .write(thumbnailPath, async error => {
                    if (error) {
                        throw reject(error);
                    }

                    const dimensions = await this.getImageDimensions(thumbnailPath);
                    const thumbnailFileInfo = await fromFile(thumbnailPath);
                    const thumbnailFileStats = fileSystem.statSync(thumbnailPath);
                    const thumbnail = new this.uploadModel({
                        id,
                        size: thumbnailFileStats.size,
                        mimeType: thumbnailFileInfo.mime,
                        extension: thumbnailFileInfo.ext,
                        meta: {
                            width: dimensions.width,
                            height: dimensions.height
                        },
                        type: UploadType.IMAGE,
                        name: `${id}.${thumbnailFileInfo.ext}`,
                        originalName: `${id}.${thumbnailFileInfo.ext}`
                    });
                    resolve(await thumbnail.save());
                });
        })
    }

    public async getImage(imageName: string, response: Response): Promise<void> {
        const image = await this.uploadModel.findOne({
            name: imageName
        })
            .exec();

        if (!image) {
            throw new HttpException(
                `Could not find image with name ${imageName}`,
                HttpStatus.NOT_FOUND
            )
        }

        if (fileSystem.existsSync(path.join(config.IMAGES_THUMBNAILS_DIRECTORY, imageName))) {
            response.download(path.join(config.IMAGES_THUMBNAILS_DIRECTORY, imageName));
        } else if (fileSystem.existsSync(path.join(config.IMAGES_DIRECTORY, imageName))) {
            response.download(path.join(config.IMAGES_DIRECTORY, imageName));
        } else {
            throw new HttpException(
                `Image ${imageName} was found in database, but is absent in file system`,
                HttpStatus.NOT_FOUND
            )
        }
    }
}
