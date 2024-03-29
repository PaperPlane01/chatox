import {HttpException, HttpStatus, Inject, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Store} from "cache-manager";
import {Response} from "express";
import {Model, Types} from "mongoose";
import graphicsMagic, {Dimensions} from "gm";
import {promises} from "fs";
import path from "path";
import {FileTypeResult} from "file-type";
import {getInfo} from "gify-parse";
import {ImageSizeRequest} from "./types/request";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {GifUploadMetadata, ImageUploadMetadata, Upload, UploadDocument, UploadType} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {UploadResponse} from "../uploads/types/responses";
import {generateFileInfoCacheKey} from "../utils/cache-utils";
import {getFileType, streamFileToResponse} from "../utils/file-utils";
import {mapAsync} from "../utils/map-async";
import {User} from "../auth";

const fileSystem = promises;

const gm = graphicsMagic.subClass({imageMagick: true});

interface SaveImageOptions {
    fileId: Types.ObjectId,
    filePath: string,
    fileInfo: FileTypeResult,
    multipartFile: MultipartFile,
    userId: string
}

interface RedisFileInfo {
    name: string,
    mimeType: string,
    thumbnail?: boolean
}

const SUPPORTED_IMAGES_FORMATS = [
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "tiff"
];

const isImageFormatSupported = (imageFormat: string) => SUPPORTED_IMAGES_FORMATS.includes(imageFormat.trim().toLowerCase());

const STANDARD_THUMBNAIL_SIZES = [64, 128, 256, 300, 400, 512, 1024, 2048];

@Injectable()
export class ImagesUploadService {
    private readonly log = new Logger(ImagesUploadService.name);

    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<ImageUploadMetadata | GifUploadMetadata>>,
                private readonly uploadMapper: UploadMapper,
                @Inject(CACHE_MANAGER) private readonly cacheManager: Store) {}

    public async uploadImage(multipartFile: MultipartFile, currentUser: User): Promise<UploadResponse<ImageUploadMetadata | GifUploadMetadata>> {
        return new Promise<UploadResponse<ImageUploadMetadata | GifUploadMetadata>>(async resolve => {
            const id = new Types.ObjectId();
            const temporaryFilePath = path.join(config.IMAGES_DIRECTORY, `${id.toHexString()}.tmp`);
            const fileHandle = await fileSystem.open(temporaryFilePath, "w");
            await fileSystem.writeFile(fileHandle, multipartFile.buffer);
            await fileHandle.close();

            const fileInfo = await getFileType(temporaryFilePath);

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
                        multipartFile,
                        userId: currentUser.id
                    }))
                } else {
                    resolve(this.saveGif({
                        fileId: id,
                        fileInfo,
                        filePath: temporaryFilePath,
                        multipartFile,
                        userId: currentUser.id
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

    private async saveImage(options: SaveImageOptions): Promise<UploadResponse<ImageUploadMetadata>> {
       const imageDimensions = await this.getImageDimensions(options.filePath);
       const thumbnails = await mapAsync(
           STANDARD_THUMBNAIL_SIZES.filter(size => size < imageDimensions.width),
           size => this.generateThumbnail(
               options.filePath,
               {
                   ...options.fileInfo,
                   ...imageDimensions,
                   id: options.fileId
               },
               size
           )
       );

       const permanentPath = path.join(config.IMAGES_DIRECTORY, `${options.fileId}.${options.fileInfo.ext}`);
       await fileSystem.rename(options.filePath, permanentPath);

       const image= new Upload({
           _id: options.fileId,
           name: `${options.fileId}.${options.fileInfo.ext}`,
           mimeType: options.fileInfo.mime,
           extension: options.fileInfo.ext,
           meta: {
               width: imageDimensions.width,
               height: imageDimensions.height,
           },
           originalName: options.multipartFile.originalname,
           type: UploadType.IMAGE,
           size: options.multipartFile.size,
           userId: options.userId,
           thumbnails,
           isPreview: false,
           isThumbnail: false
       });
       await new this.uploadModel(image).save();
       return this.uploadMapper.toUploadResponse(image);
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

    private async saveGif(options: SaveImageOptions): Promise<UploadResponse<ImageUploadMetadata | GifUploadMetadata>> {
        const gifFile = await fileSystem.readFile(options.filePath);
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

        const previewImage = await this.generateGifPreview(options.filePath);

        const permanentFilePath = path.join(config.IMAGES_DIRECTORY, `${options.fileId}.${options.fileInfo.ext}`);
        await fileSystem.rename(options.filePath, permanentFilePath);

        const gif = new Upload({
            _id: options.fileId,
            name: `${options.fileId.toHexString()}.${options.fileInfo.ext}`,
            mimeType: options.fileInfo.mime,
            size: options.multipartFile.size,
            extension: options.fileInfo.ext,
            type: UploadType.GIF,
            originalName: options.multipartFile.originalname,
            previewImage,
            userId: options.userId,
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
        await new this.uploadModel(gif).save();

        return this.uploadMapper.toUploadResponse(gif);
    }

    private generateThumbnail(
        originalImagePath: string,
        originalImageInfo: FileTypeResult & ImageUploadMetadata & {id: Types.ObjectId},
        size: number
    ): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>(async (resolve, reject) => {
            const id = new Types.ObjectId();
            const idString = id.toHexString();

            if (originalImageInfo.ext === "gif") {
                const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${idString}.jpg`);

                gm(`${originalImagePath}[0]`)
                    .resize(size)
                    .write(thumbnailPath, async error => {
                        if (error) {
                            reject(error);
                        }
                        resolve(this.saveThumbnailOrPreview(id, thumbnailPath, {isPreview: false, isThumbnail: true}));
                    })
            } else {
                const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${idString}.${originalImageInfo.ext}`);

                gm(originalImagePath).resize(size)
                    .write(thumbnailPath, async error => {
                        if (error) {
                            reject(error);
                        }
                        resolve(this.saveThumbnailOrPreview(id, thumbnailPath, {isThumbnail: true, isPreview: false}))
                    });
            }
        })
    }

    private async generateGifPreview(gifPath: string): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>((resolve, reject) => {
            const id = new Types.ObjectId();
            const previewPath = path.join(config.IMAGES_DIRECTORY, `${id.toHexString()}.jpg`);

            gm(`${gifPath}[0]`)
                .write(previewPath, async error => {
                    if (error) {
                        reject(error);
                    }

                    resolve(this.saveThumbnailOrPreview(id, previewPath, {isThumbnail: false, isPreview: false}));
                })
        })
    }

    private async saveThumbnailOrPreview(id: Types.ObjectId, path: string, options: {isThumbnail: boolean, isPreview: boolean}): Promise<Upload<ImageUploadMetadata>> {
        const dimensions = await this.getImageDimensions(path);
        const fileInfo = await getFileType(path);
        const fileStats = await fileSystem.stat(path);
        let thumbnails: Upload<ImageUploadMetadata>[] = [];

        if (options.isPreview) {
            thumbnails = await mapAsync(
                STANDARD_THUMBNAIL_SIZES.filter(size => size < dimensions.width),
                size => this.generateThumbnail(
                    path,
                    {
                        ...fileInfo,
                        ...dimensions,
                        id
                    },
                    size
                )
            );
        }

        const image = new Upload({
            _id: id,
            size: fileStats.size,
            mimeType: fileInfo.mime,
            extension: fileInfo.ext,
            meta: {
                width: dimensions.width,
                height: dimensions.height
            },
            type: UploadType.IMAGE,
            name: `${id.toHexString()}.${fileInfo.ext}`,
            originalName: `${id.toHexString()}.${fileInfo.ext}`,
            isThumbnail: options.isThumbnail,
            isPreview: options.isPreview,
            thumbnails
        })
        await new this.uploadModel(image).save();

        return image;
    }

    public async getImage(imageName: string, imageSizeRequest: ImageSizeRequest, response: Response): Promise<void> {
        response.setHeader("Cache-Control", "max-age=31536000");

        const cacheKey = generateFileInfoCacheKey(imageName, imageSizeRequest.size);
        const fileInfo: RedisFileInfo | undefined = await this.cacheManager.get(cacheKey);

        if (fileInfo) {
            const baseDirectory = fileInfo.thumbnail
                ? config.IMAGES_THUMBNAILS_DIRECTORY
                : config.IMAGES_DIRECTORY;
            await streamFileToResponse(path.join(baseDirectory, fileInfo.name), response, this.log);
            return;
        }

        const image = await this.uploadModel.findOne({
            name: imageName
        });

        if (!image) {
            throw new HttpException(
                `Could not find image with name ${imageName}`,
                HttpStatus.NOT_FOUND
            )
        }

        response.header("Content-Type", image.mimeType);
        let imagePath: string;

        if (image.isThumbnail) {
            imagePath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, imageName);
        } else {
            if (imageSizeRequest.size !== undefined && imageSizeRequest.size < image.meta.width) {
                const thumbnail = await this.getThumbnailOrCreateNew(image, imageSizeRequest.size);
                await this.cacheManager.set(cacheKey, {
                    name: thumbnail.name,
                    mimeType: thumbnail.mimeType,
                    thumbnail: true
                });
                imagePath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, thumbnail.name);
            } else {
                await this.cacheManager.set(cacheKey, {
                    name: imageName,
                    mimeType: image.mimeType
                });
                imagePath = path.join(config.IMAGES_DIRECTORY, imageName);
            }
        }

        await streamFileToResponse(imagePath, response, this.log);
    }

    private async getThumbnailOrCreateNew(image: Upload<ImageUploadMetadata>, size: number): Promise<Upload<ImageUploadMetadata>> {
        const thumbnail = image.thumbnails.find(thumbnail => thumbnail.meta.width === size);

        if (thumbnail) {
            return thumbnail;
        } else {
            const imagePath = path.join(config.IMAGES_DIRECTORY, image.name);
            const fileInfo = await getFileType(imagePath);

            return this.generateThumbnail(
                path.join(config.IMAGES_DIRECTORY, image.name),
                {
                    ...fileInfo,
                    ...image.meta,
                    id: image._id
                },
                size
            );
        }
    }
}
