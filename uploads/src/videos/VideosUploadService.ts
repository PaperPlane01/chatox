import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import ffmpeg from "fluent-ffmpeg";
import {fromFile} from "file-type";
import graphicsMagic, {Dimensions} from "gm";
import {promises as fileSystem, createReadStream} from "fs";
import path from "path";
import {ImageUploadMetadata, Upload, UploadType, VideoUploadMetadata} from "../mongoose/entities";
import {UploadMapper} from "../common/mappers";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {config} from "../config";
import {CurrentUserHolder} from "../context/CurrentUserHolder";
import {FfmpegWrapper} from "../ffmpeg";

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
    constructor(@InjectModel("upload") private readonly uploadModel: Model<Upload<VideoUploadMetadata | ImageUploadMetadata>>,
                private readonly uploadMapper: UploadMapper,
                private readonly currentUserHolder: CurrentUserHolder,
                private readonly ffmpegWrapper: FfmpegWrapper) {

    }

    public uploadVideo(multipartFile: MultipartFile): Promise<UploadInfoResponse<VideoUploadMetadata>> {
        return new Promise<UploadInfoResponse<VideoUploadMetadata>>(async (resolve, reject) => {
            const currentUser = this.currentUserHolder.getCurrentUser();
            const id = new Types.ObjectId().toHexString();
            const temporaryFilePath = path.join(config.VIDEOS_DIRECTORY, `${id}.tmp`);
            const fileHandle = await fileSystem.open(temporaryFilePath, "w");
            await fileSystem.writeFile(fileHandle, multipartFile.buffer);
            await fileHandle.close();

            const fileInfo = await fromFile(temporaryFilePath);

            if (isVideoFormatSupported(fileInfo.ext)) {
                const permanentFilePath = path.join(config.VIDEOS_DIRECTORY, `${id}.${fileInfo.ext}`);
                await fileSystem.rename(temporaryFilePath, permanentFilePath);
                const meta = await this.getVideoMetadata(permanentFilePath);
                const previewImage = await this.saveVideoPreview(permanentFilePath);
                const thumbnail = await this.saveVideoThumbnail(permanentFilePath);

                const video: Upload<VideoUploadMetadata> = new this.uploadModel({
                    id,
                    name: `${id}.${fileInfo.ext}`,
                    mimeType: fileInfo.mime,
                    meta,
                    previewImage,
                    thumbnail,
                    type: UploadType.VIDEO,
                    isPreview: false,
                    isThumbnail: false,
                    originalName: multipartFile.originalname,
                    size: multipartFile.size,
                    extension: fileInfo.ext,
                    userId: currentUser!.id
                }) as Upload<VideoUploadMetadata>;
                await video.save();
                resolve(this.uploadMapper.toUploadInfoResponse(video));
            } else {
                reject(new HttpException(
                    `Video format ${fileInfo.ext} is not supported`,
                    HttpStatus.BAD_REQUEST
                ));
            }
        })
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
            const imageId = new Types.ObjectId().toHexString();
            const imageName = `${imageId}.jpg`;
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
                    const fileInfo = await fromFile(imagePath);
                    const {width, height} = await this.getImageDimensions(imagePath);
                    const fileStats = await fileSystem.stat(imagePath);
                    const meta: ImageUploadMetadata = {
                        width,
                        height
                    };
                    const videoPreview: Upload<ImageUploadMetadata> = new this.uploadModel({
                        id: imageId,
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
                    await videoPreview.save();
                    resolve(videoPreview);
                })
                .on("error", error => {
                    reject(error);
                })
        })
    }

    private saveVideoThumbnail(videoPath: string): Promise<Upload<ImageUploadMetadata>> {
        return new Promise<Upload<ImageUploadMetadata>>((resolve, reject) => {
            const imageId = new Types.ObjectId().toHexString();
            const imageName = `${imageId}.jpg`;
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
                    const fileInfo = await fromFile(imagePath);
                    const fileStats = await fileSystem.stat(imagePath);
                    const meta: ImageUploadMetadata = {
                        width,
                        height
                    };
                    const videoThumbnail: Upload<ImageUploadMetadata> = new this.uploadModel({
                        id: imageId,
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
                    await videoThumbnail.save();
                    resolve(videoThumbnail);
                })
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
