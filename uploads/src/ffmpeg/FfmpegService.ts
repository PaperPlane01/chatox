import {BadRequestException, Injectable} from "@nestjs/common";
import {Dimensions} from "gm";
import {promises as fileSystem} from "fs";
import {FileTypeResult} from "file-type";
import {FfmpegWrapper} from "./FfmpegWrapper";
import {ImageUploadMetadata, ThumbnailMetadata, Upload, UploadType, VideoUploadMetadata} from "../uploads";
import {Types} from "mongoose";
import path from "path";
import {config} from "../config";
import {getFileType} from "../utils/file-utils";
import {GraphicsMagicService} from "../graphics-magic";
import {mapAsync} from "../utils/map-async";
import {STANDARD_THUMBNAIL_SIZES} from "../images/constants";

@Injectable()
export class FfmpegService {

	constructor(private readonly ffmpegWrapper: FfmpegWrapper,
				private readonly graphicsMagicService: GraphicsMagicService) {
	}

	public getVideoMetadata(videoPath: string): Promise<VideoUploadMetadata> {
		return new Promise((resolve, reject) => {
			this.ffmpegWrapper
				.ffmpeg(videoPath)
				.ffprobe((error, data) => {
					if (error) {
						reject(error);
					}

					const streams = data.streams.sort((left, right) => left.width - right.width);

					if (streams.length === 0) {
						reject(new BadRequestException("Video does not contain any stream"));
					}

					const stream = streams[0];
					const hasAudio = Boolean(streams.find(stream => stream.codec_type === "audio"));
					const {width, height, avg_frame_rate} = stream;
					const framerate = this.getFramerate(avg_frame_rate);
					const duration = data.format.duration * 1000;

					resolve({
						width,
						height,
						duration,
						hasAudio,
						framerate
					});
				});
		});
	}

	private getFramerate(framerateString: string): number | undefined {
		if (!framerateString.includes("/")) {
			return undefined;
		}

		const split = framerateString.split("/");

		if (split.length !== 2) {
			return undefined;
		}

		const numerator = Number(split[0]);
		const denomiator = Number(split[1]);
		const result = numerator / denomiator;

		return isNaN(result) ? undefined : result;
	}

	public createVideoPreview(videoPath: string): Promise<Upload<ImageUploadMetadata>> {
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
					const {width, height} = await this.getImageDimensions(imagePath);
					const fileInfo = await getFileType(imagePath);
					const fileStats = await fileSystem.stat(imagePath);
					const meta: ImageUploadMetadata = {
						width,
						height
					};
					const thumbnails = await mapAsync(
						STANDARD_THUMBNAIL_SIZES.filter(size => size < width),
						size => this.createThumbnail(imagePath, fileInfo, size)
					);
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
						isPreview: true,
						thumbnails
					});
					resolve(videoPreview);
				})
				.on("error", error => reject(error));
		})
	}

	private async getImageDimensions(filePath: string): Promise<Dimensions> {
		return await this.graphicsMagicService.getImageDimensions(filePath);
	}

	private async createThumbnail(originalPath: string, fileType: FileTypeResult, size: number): Promise<Upload<ThumbnailMetadata>> {
		const id = new Types.ObjectId();
		const name = `${id.toHexString()}.${fileType.ext}`;
		const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, `${id.toHexString()}.${fileType.ext}`);
		await this.graphicsMagicService.createImageThumbnail(originalPath, thumbnailPath, size);
		const {width, height} = await this.graphicsMagicService.getImageDimensions(thumbnailPath);
		const fileStats = await fileSystem.stat(thumbnailPath);
		return new Upload<ThumbnailMetadata>({
			_id: id,
			name,
			mimeType: fileType.mime,
			extension: fileType.ext,
			meta: {
				width,
				height,
				animated: false
			},
			originalName: name,
			type: UploadType.IMAGE,
			size: fileStats.size,
			isThumbnail: true,
			isPreview: false
		});
	}
}
