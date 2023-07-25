import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Request, Response} from "express";
import {Model, Types} from "mongoose";
import {createReadStream, promises as fileSystem} from "fs";
import path from "path";
import {fromFile} from "file-type";
import contentDisposition from "content-disposition";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {FfmpegWrapper} from "../ffmpeg";
import {AudioUploadMetadata, Upload, UploadDocument, UploadType} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {UploadResponse} from "../uploads/types/responses";
import {User} from "../auth";

const SUPPORTED_AUDIO_FORMATS = [
    "mp3",
    "ogg",
    "flac"
];

const isAudioFormatSupported = (format: string): boolean => SUPPORTED_AUDIO_FORMATS.includes(format);

@Injectable()
export class AudiosUploadService {
    constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<AudioUploadMetadata>>,
                private readonly uploadMapper: UploadMapper,
                private readonly ffmpegFactory: FfmpegWrapper) {

    }

    public async uploadAudio(multipartFile: MultipartFile, currentUser: User, originalName?: string): Promise<UploadResponse<AudioUploadMetadata>> {
        const id = new Types.ObjectId();
        const temporaryFilePath = path.join(config.AUDIOS_DIRECTORY, `${id.toHexString()}.tmp`);
        const fileHandle = await fileSystem.open(temporaryFilePath, "w");
        await fileSystem.writeFile(fileHandle, multipartFile.buffer);
        await fileHandle.close();

        const fileInfo = await fromFile(temporaryFilePath);

        if (!isAudioFormatSupported(fileInfo.ext)) {
            throw new HttpException(
                `Audio format ${fileInfo.ext} is not supported`,
                HttpStatus.BAD_REQUEST
            );
        }

        const permanentFilePath = path.join(config.AUDIOS_DIRECTORY, `${id}.${fileInfo.ext}`);
        await fileSystem.rename(temporaryFilePath, permanentFilePath);

        const meta = await this.getAudioMetadata(permanentFilePath);

        const audio = new Upload({
            _id: id,
            name: `${id.toHexString()}.${fileInfo.ext}`,
            originalName: originalName ? originalName : multipartFile.originalname,
            size: multipartFile.size,
            mimeType: fileInfo.mime,
            extension: fileInfo.ext,
            meta,
            type: UploadType.AUDIO,
            userId: currentUser.id
        });
        await new this.uploadModel(audio).save();

        return this.uploadMapper.toUploadResponse(audio);
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
                });
        });
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
