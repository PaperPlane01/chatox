import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Response} from "express";
import {Model, Types} from "mongoose";
import {createReadStream, promises as fileSystem} from "fs";
import path from "path";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {FfmpegService} from "../ffmpeg";
import {ImageUploadMetadata, Upload, UploadDocument, UploadType, VideoUploadMetadata} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {UploadResponse} from "../uploads/types/responses";
import {User} from "../auth";
import {getFileType} from "../utils/file-utils";

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
                private readonly ffmpegService: FfmpegService) {

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

            const video = new Upload({
                _id: id,
                name: `${id}.${fileInfo.ext}`,
                mimeType: fileInfo.mime,
                meta,
                previewImage,
                thumbnails: previewImage.thumbnails,
                type: UploadType.VIDEO,
                isPreview: false,
                isThumbnail: false,
                originalName: multipartFile.originalname,
                size: multipartFile.size,
                extension: fileInfo.ext,
                userId: currentUser.id
            });
            await new this.uploadModel(video).save();

            return this.uploadMapper.toUploadResponse(video);
        }
    }

    private getVideoMetadata(videoPath: string): Promise<VideoUploadMetadata> {
        return this.ffmpegService.getVideoMetadata(videoPath);
    }

    private async saveVideoPreview(videoPath: string): Promise<Upload<ImageUploadMetadata>> {
        const preview = await this.ffmpegService.createVideoPreview(videoPath);
        await this.uploadModel.insertMany([
            preview,
            ...preview.thumbnails
        ]);
        return preview;
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
