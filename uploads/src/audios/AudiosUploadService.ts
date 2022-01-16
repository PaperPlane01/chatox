import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Request, Response} from "express";
import {Model, Types} from "mongoose";
import {createReadStream, promises as fileSystem} from "fs";
import path from "path";
import {fromFile} from "file-type";
import contentDisposition from "content-disposition";
import {AudioUploadMetadata, Upload, UploadType} from "../mongoose/entities";
import {UploadMapper} from "../common/mappers";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {config} from "../config";
import {CurrentUserHolder} from "../context/CurrentUserHolder";
import {FfmpegWrapper} from "../ffmpeg";

const SUPPORTED_AUDIO_FORMATS = [
    "mp3",
    "ogg",
    "flac"
];

const isAudioFormatSupported = (format: string): boolean => SUPPORTED_AUDIO_FORMATS.includes(format);

@Injectable()
export class AudiosUploadService {
    constructor(@InjectModel("upload") private readonly uploadModel: Model<Upload<AudioUploadMetadata>>,
                private readonly uploadMapper: UploadMapper,
                private readonly currentUserHolder: CurrentUserHolder,
                private readonly ffmpegFactory: FfmpegWrapper) {

    }

    public async uploadAudio(multipartFile: MultipartFile, originalName?: string): Promise<UploadInfoResponse<AudioUploadMetadata>> {
        return new Promise<UploadInfoResponse<AudioUploadMetadata>>(async (resolve, reject) => {
            const currentUser = this.currentUserHolder.getCurrentUser();
            const id = new Types.ObjectId().toHexString();
            const temporaryFilePath = path.join(config.AUDIOS_DIRECTORY, `${id}.tmp`);
            const fileHandle = await fileSystem.open(temporaryFilePath, "w");
            await fileSystem.writeFile(fileHandle, multipartFile.buffer);
            await fileHandle.close();

            const fileInfo = await fromFile(temporaryFilePath);

            if (!isAudioFormatSupported(fileInfo.ext)) {
                reject(new HttpException(
                    `Audio format ${fileInfo.ext} is not supported`,
                    HttpStatus.BAD_REQUEST
                ));
            }

            const permanentFilePath = path.join(config.AUDIOS_DIRECTORY, `${id}.${fileInfo.ext}`);
            await fileSystem.rename(temporaryFilePath, permanentFilePath);

            const meta = await this.getAudioMetadata(permanentFilePath);

            const audio: Upload<AudioUploadMetadata> = new this.uploadModel({
                id,
                name: `${id}.${fileInfo.ext}`,
                originalName: originalName ? originalName : multipartFile.originalname,
                size: multipartFile.size,
                mimeType: fileInfo.mime,
                extension: fileInfo.ext,
                isThumbnail: false,
                isPreview: false,
                meta,
                type: UploadType.AUDIO,
                userId: currentUser!.id
            });
            await audio.save();
            resolve(this.uploadMapper.toUploadInfoResponse(audio));
        })
    }

    private getAudioMetadata(audioPath: string): Promise<AudioUploadMetadata> {
        return new Promise<AudioUploadMetadata>((resolve, reject) => {
            this.ffmpegFactory
                .ffmpeg(audioPath)
                .ffprobe((error, data) => {
                    if (error) {
                        reject(error);
                    }

                    resolve({
                        duration: data.format.duration * 1000,
                        bitrate: Number(data.format.bit_rate)
                    })
                })
        })
    }

    public async getAudio(audioName: string, response: Response): Promise<void> {
        const audio = await this.findAudioByName(audioName);
        response.header("Content-Type", audio.mimeType);
        const audioPath = path.join(config.AUDIOS_DIRECTORY, audio.name);
        createReadStream(audioPath).pipe(response);
    }

    public async downloadAudio(audioName: string, response: Response): Promise<void> {
        const audio = await this.findAudioByName(audioName);
        const contentDispositionHeader = contentDisposition(audio.originalName);
        response.header("Content-Type", audio.mimeType);
        response.header("Content-Disposition", contentDispositionHeader);
        const audioPath = path.join(config.AUDIOS_DIRECTORY, audio.name);
        createReadStream(audioPath).pipe(response);
    }

    public async streamAudio(audioName: string, request: Request, response: Response): Promise<void> {
        const audio = await this.findAudioByName(audioName);
        const rangeHeader = request.headers.range;

        if (rangeHeader) {
            const rangeHeaderSplit = rangeHeader
                .replace(/bytes=/, "")
                .split("-");
            const rangeStart = rangeHeaderSplit[0];
            const rangeEnd = rangeHeaderSplit[1];

            const start = parseInt(rangeStart);
            const end = rangeEnd
                ? parseInt(rangeEnd)
                : audio.size - 1;
            const chunkSize = (end - start) + 1;

            const audioStream = createReadStream(path.join(config.AUDIOS_DIRECTORY, audioName), {start, end});

            response.writeHead(
                206,
                {
                    "Content-Range": `bytes ${start}-${end}/${audio.size}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunkSize,
                    "Content-Type": audio.mimeType
                }
            );
            audioStream.pipe(response);
        }
    }

    private async findAudioByName(audioName: string): Promise<Upload<AudioUploadMetadata>> {
        const audio = await this.uploadModel.findOne({
            name: audioName
        });

        if (!audio) {
            throw new HttpException(
                `Could not find audio with name ${audioName}`,
                HttpStatus.NOT_FOUND
            );
        }

        return audio;
    }
}
