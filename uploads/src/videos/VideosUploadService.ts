import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import graphicsMagic, {Dimensions} from "gm";
import {promises as fileSystem, createReadStream} from "fs";
import path from "path";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {FfmpegWrapper} from "../ffmpeg";
import {ImageUploadMetadata, Upload, UploadDocument, UploadType, VideoUploadMetadata} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {UploadResponse} from "../uploads/types/responses";
import {User} from "../auth";
import {getFileType} from "../utils/file-utils";

const gm = graphicsMagic.subClass({imageMagick: true});

const SUPPORTED_VIDEO_FORMATS = [
    "mp4",
    "m4v",
    "avi",
    "flv",
    "webm",
    "mpeg",
    "mov",
    "mkv",
    "3gp",
    "mpg"
];

const isVideoFormatSupported = (format: string): boolean => SUPPORTED_VIDEO_FORMATS.includes(format);

@Injectable()
export class VideosUploadService {
    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<VideoUploadMetadata | ImageUploadMetadata>>,
                private readonly uploadMapper: UploadMapper,
                private readonly ffmpegWrapper: FfmpegWrapper) {

    }

    public async uploadVideo(multipartFile: MultipartFile, currentUser: User): Promise<UploadResponse<VideoUploadMetadata>> {
        const id = new Types.ObjectId();
        const temporaryFilePath = path.join(config.VIDEOS_DIRECTORY, `${id.toHexString()}.tmp`);
        const fileHandle = await fileSystem.open(temporaryFilePath, "w");
        await fileSystem.writeFile(fileHandle, multipartFile.buffer);
        await fileHandle.close();

        const fileInfo = await getFileType(temporaryFilePath);

        if (!isVideoFormatSupported(fileInfo.ext)) {
            throw new HttpException(
                `Video format ${fileInfo.ext} is not supported`,
                HttpStatus.BAD_REQUEST
            );
        } else {
            const permanentFilePath = path.join(config.VIDEOS_DIRECTORY, `${id.toHexString()}.${fileInfo.ext}`);
            await fileSystem.rename(temporaryFilePath, permanentFilePath);
            const meta = await this.getVideoMetadata(permanentFilePath);
            const previewImage = await this.saveVideoPreview(permanentFilePath);
            const thumbnail = await this.saveVideoThumbnail(permanentFilePath);

            const video = new Upload({
                _id: id,
                name: `${id}.${fileInfo.ext}`,
                mimeType: fileInfo.mime,
                meta,
                previewImage,
                thumbnails: [thumbnail],
                type: UploadType.VIDEO,
                isPreview: false,
                isThumbnail: false,
                originalName: multipartFile.originalname,
                size: multipartFile.size,
                extension: fileInfo.ext,
                userId: currentUser!.id
            });
            await new this.uploadModel(video).save();

            return this.uploadMapper.toUploadResponse(video);
        }
    }

    private getVideoMetadata(videoPath: string): Promise<VideoUploadMetadata> {
        return new Promise<VideoUploadMetadata>((resolve, reject) => {
            this.ffmpegWrapper
                .ffmpeg(videoPath)
                .ffprobe((error, data) => {
                    if (error) {
                        reject(error);
                    }

                    const duration = data.format.duration * 1000;
                    const streams = data.streams.sort((left, right) => {
                        return left.width - right.width;
                    });

                    if (streams.length === 0) {
                        reject(new HttpException(
                            `Video does not contain any streams`,
                            HttpStatus.NOT_FOUND
                        ))
                    }

                    const stream = streams[0];
                    const width = stream.width;
                    const height = stream.height;

                    resolve({
                        duration,
                        width,
                        height
                    });
                })
        })
    }

    private saveVideoPreview(videoPath: string): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>((resolve, reject) => {
            const imageId = new Types.ObjectId();
            const imageName = `${imageId.toHexString()}.jpg`;
            const imagePath = path.join(config.IMAGES_DIRECTORY, imageName);

            this.ffmpegWrapper
                .ffmpeg(videoPath)
                .takeScreenshots({
                    folder: config.IMAGES_DIRECTORY,
                    filename: imageName,
                    count: 1,
                    timemarks: [0]
                })
                .on("end", async () => {
                    const fileInfo = await getFileType(imagePath);
                    const {width, height} = await this.getImageDimensions(imagePath);
                    const fileStats = await fileSystem.stat(imagePath);
                    const meta: ImageUploadMetadata = {
                        width,
                        height
                    };
                    const videoPreview = new Upload({
                        _id: imageId,
                        name: imageName,
                        mimeType: fileInfo.mime,
                        extension: fileInfo.ext,
                        meta,
                        type: UploadType.IMAGE,
                        originalName: imageName,
                        size: fileStats.size,
                        isThumbnail: false,
                        isPreview: true
                    });
                    await new this.uploadModel(videoPreview).save();
                    resolve(videoPreview);
                })
                .on("error", error => {
                    reject(error);
                })
        })
    }

    private saveVideoThumbnail(videoPath: string): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>((resolve, reject) => {
            const imageId = new Types.ObjectId();
            const imageName = `${imageId.toHexString()}.jpg`;
            const imagePath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, imageName);

            this.ffmpegWrapper
                .ffmpeg(videoPath)
                .takeScreenshots({
                    folder: config.IMAGES_THUMBNAILS_DIRECTORY,
                    filename: imageName,
                    count: 1,
                    timemarks: [0]
                })
                .on("end", async () => {
                    await this.resizeImageToThumbnail(imagePath);
                    const {width, height} = await this.getImageDimensions(imagePath);
                    const fileInfo = await getFileType(imagePath);
                    const fileStats = await fileSystem.stat(imagePath);
                    const meta: ImageUploadMetadata = {
                        width,
                        height
                    };
                    const videoThumbnail = new Upload({
                        _id: imageId,
                        name: imageName,
                        mimeType: fileInfo.mime,
                        extension: fileInfo.ext,
                        meta,
                        type: UploadType.IMAGE,
                        originalName: imageName,
                        size: fileStats.size,
                        isThumbnail: true,
                        isPreview: false
                    });
                    await new this.uploadModel(videoThumbnail).save();
                    resolve(videoThumbnail);
                })
                .on("error", error => reject(error));
        })
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

    private resizeImageToThumbnail(thumbnailPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            gm(thumbnailPath)
                .resize(200)
                .write(thumbnailPath, error => {
                    if (error) {
                        reject(error);
                    }

                    resolve();
                })
        })
    }

    public async getVideo(videoName: string, response: Response): Promise<void> {
        const video = await this.uploadModel.findOne({
            name: videoName
        })
            .exec();

        if (!video) {
            throw new HttpException(
                `Could not find video with name ${videoName}`,
                HttpStatus.NOT_FOUND
            )
        }

        response.header("Content-Type", video.mimeType);
        createReadStream(path.join(config.VIDEOS_DIRECTORY, videoName)).pipe(response);
    }
}
