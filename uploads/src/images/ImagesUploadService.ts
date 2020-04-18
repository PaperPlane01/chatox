import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import graphicsMagic, {Dimensions} from "gm";
import fileSystem from "fs";
import path from "path";
import {FileTypeResult, fromFile} from "file-type";
import {getInfo} from "gify-parse";
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

const SUPPORTED_IMAGES_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "tiff"
];

const isImageFormatSupported = (imageFormat: string) => SUPPORTED_IMAGES_FORMATS.includes(imageFormat.trim().toLowerCase());

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
                    if (!isImageFormatSupported(fileInfo.ext)) {
                        throw new HttpException(
                            `Format ${fileInfo.ext} is not supported`,
                            HttpStatus.BAD_REQUEST
                        );
                    }
                    resolve(this.saveImage({
                        fileId: id,
                        fileInfo,
                        filePath: temporaryFilePath,
                        multipartFile
                    }))
                } else {
                    resolve(this.saveGif({
                        fileId: id,
                        fileInfo,
                        filePath: temporaryFilePath,
                        multipartFile
                    }))
                }
            } else {
                throw new HttpException(
                    `Could not identify uploaded file as image. It may be corrupted or may not be image at all`,
                    HttpStatus.BAD_REQUEST
                )
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

    private async saveGif(options: SaveImageOptions): Promise<UploadInfoResponse<ImageUploadMetadata | GifUploadMetadata>> {
        const gifFile = fileSystem.readFileSync(options.filePath);
        const gifInfo = getInfo(gifFile);

        if (!gifInfo.valid) {
            throw new HttpException(
                `Uploaded GIF is invalid`,
                HttpStatus.BAD_REQUEST
            )
        }

        const width: number = gifInfo.width;
        const height: number = gifInfo.height;
        const duration: number = gifInfo.duration;
        const durationIE: number = gifInfo.durationIE;
        const durationOpera: number = gifInfo.durationOpera;
        const durationChrome: number = gifInfo.durationChrome;
        const durationFirefox: number = gifInfo.durationFirefox;
        const durationSafari: number = gifInfo.durationSafari;
        const animated: boolean = gifInfo.animated;
        const loopCount: number = gifInfo.loopCount;
        const infinite: boolean = animated && loopCount === 0;

        const thumbnail = await this.generateThumbnail(options.filePath, options.fileInfo);
        const preview = await this.generateGifPreview(options.filePath);

        const permanentFilePath = path.join(config.IMAGES_DIRECTORY, `${options.fileId}.${options.fileInfo.ext}`);
        fileSystem.renameSync(options.filePath, permanentFilePath);

        const gif: Upload<ImageUploadMetadata | GifUploadMetadata> = new this.uploadModel({
            id: options.fileId,
            name: `${options.fileId}.${options.fileInfo.ext}`,
            mimeType: options.fileInfo.mime,
            size: options.multipartFile.size,
            extension: options.fileInfo.ext,
            type: UploadType.GIF,
            originalName: options.multipartFile.originalname,
            thumbnail,
            preview,
            meta: {
                width,
                height,
                duration,
                durationChrome,
                durationFirefox,
                durationIE,
                durationOpera,
                durationSafari,
                infinite,
                loopCount,
                animated
            }
        });
        await gif.save();

        return this.uploadMapper.toUploadInfoResponse(gif);
    }

    private generateThumbnail(originalImagePath: string, originalImageInfo: FileTypeResult): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>(async (resolve, reject) => {
            const id = new Types.ObjectId().toHexString();

            if (originalImageInfo.ext === "gif") {
                const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${id}.jpg`);

                gm(`${originalImagePath}[0]`)
                    .resize(200)
                    .write(thumbnailPath, async error => {
                        if (error) {
                            reject(error);
                        }
                        resolve(this.saveThumbnailOrPreview(id, thumbnailPath));
                    })
            } else {
                const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${id}.${originalImageInfo.ext}`);

                gm(originalImagePath).resize(200)
                    .write(thumbnailPath, async error => {
                        if (error) {
                            reject(error);
                        }
                        resolve(this.saveThumbnailOrPreview(id, thumbnailPath))
                    });
            }
        })
    }

    private async generateGifPreview(gifPath: string): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>((resolve, reject) => {
            const id = new Types.ObjectId().toHexString();
            const previewPath = path.join(config.IMAGES_DIRECTORY, `${id}.jpg`);

            gm(`${gifPath}[0]`)
                .write(previewPath, async error => {
                    if (error) {
                        reject(error);
                    }

                    resolve(this.saveThumbnailOrPreview(id, previewPath));
                })
        })
    }

    private async saveThumbnailOrPreview(id: string, thumbnailPath: string): Promise<Upload<ImageUploadMetadata>> {
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
        await thumbnail.save();
        return thumbnail;
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
