import {
	BadRequestException,
	HttpException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Store} from "cache-manager";
import {Model, Types} from "mongoose";
import {Response} from "express";
import {PathLike, promises as fileSystem} from "fs";
import path from "path";
import {FileTypeResult} from "file-type";
import {isAnimatedWebP, isWebP} from "is-webp-extended";
import {config} from "../config";
import {
	ImageUploadMetadata,
	StickerUploadMetadata,
	Upload,
	UploadDocument,
	UploadType,
	VideoUploadMetadata
} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {ImageSizeRequest, MultipartFile} from "../common/types/request";
import {User} from "../auth";
import {UploadResponse} from "../uploads/types/responses";
import {createFileFromBuffer, exists, getFileType, streamFileToResponse} from "../utils/file-utils";
import {GraphicsMagicService} from "../graphics-magic";
import {mapAsync} from "../utils/map-async";
import {generateFileInfoCacheKey} from "../utils/cache-utils";
import {RedisFileInfo} from "../common/types";
import {LottieService} from "../lottie";
import {FfmpegService} from "../ffmpeg";

const ALLOWED_IMAGE_STICKER_FORMATS = [
	"png",
	"webp",
	"jpg"
];
const STICKER_THUMBNAIL_SIZES = [64, 128, 256];
const VALID_STICKER_SIZE = 512;

type LottieStickerFormat = "json" | "lottie" | "tgs";

@Injectable()
export class StickersUploadService {
	private readonly log = new Logger(StickersUploadService.name);

	constructor(
		@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<StickerUploadMetadata | ImageUploadMetadata>>,
		private readonly uploadMapper: UploadMapper,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Store,
		private readonly graphicsMagicService: GraphicsMagicService,
		private readonly lottieService: LottieService,
		private readonly ffmpegService: FfmpegService) {
	}

	public async uploadImageSticker(file: MultipartFile, user: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.createImageSticker(file, user, UploadType.IMAGE_STICKER);
	}

	public async uploadWebpSticker(file: MultipartFile, user: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.createImageSticker(file, user, UploadType.WEBP_STICKER);
	}

	private async createImageSticker(
		file: MultipartFile,
		user: User,
		type: UploadType.IMAGE_STICKER | UploadType.WEBP_STICKER,
	): Promise<UploadResponse<StickerUploadMetadata>> {
		const id = new Types.ObjectId();
		const stringId = id.toHexString();
		const temporaryFilePath = path.join(config.STICKERS_DIRECTORY, `${stringId}.tmp`);
		await createFileFromBuffer(temporaryFilePath, file.buffer);

		const {
			fileInfo,
			meta: {
				width,
				height,
				animated
			}
		} = await this.validateFileAndGetFileInfoForImageSticker(temporaryFilePath, type);
		const fileName =`${stringId}.${fileInfo.ext}`;
		const permanentFilePath = path.join(config.STICKERS_DIRECTORY, fileName);
		await fileSystem.rename(temporaryFilePath, permanentFilePath);

		const sticker = new Upload<StickerUploadMetadata>({
			_id: id,
			size: file.size,
			originalName: file.originalname ?? fileName,
			name: fileName,
			isPreview: false,
			isThumbnail: false,
			mimeType: fileInfo.mime,
			extension: fileInfo.ext,
			meta: {
				width,
				height,
				animated
			},
			type,
			userId: user.id
		});
		sticker.thumbnails = await this.createImageStickerThumbnails(
			sticker,
			permanentFilePath
		);

		if (type === UploadType.WEBP_STICKER && animated) {
			sticker.previewImage = await this.createAnimatedWebpPreview(permanentFilePath, sticker);
		}

		await new this.uploadModel(sticker).save();

		return this.uploadMapper.toUploadResponse(sticker);
	}

	private async validateFileAndGetFileInfoForImageSticker(
		filePath: string,
		type: UploadType.IMAGE_STICKER | UploadType.WEBP_STICKER
	): Promise<{meta: StickerUploadMetadata, fileInfo: FileTypeResult}> {
		const fileInfo = await getFileType(filePath);
		let error: HttpException | undefined = undefined;

		if (!fileInfo.mime.startsWith("image") || !ALLOWED_IMAGE_STICKER_FORMATS.includes(fileInfo.ext)) {
			error = new BadRequestException("Invalid image for sticker");
		}

		let animated = false;

		if (type === UploadType.WEBP_STICKER) {
			const file = await fileSystem.readFile(filePath);

			if (!await isWebP(file)) {
				error = new BadRequestException("Invalid webp file");
			}

			animated = await isAnimatedWebP(file);
		}

		const dimensions = await this.graphicsMagicService.getImageDimensions(filePath);

		if (dimensions.width !== VALID_STICKER_SIZE && dimensions.height !== VALID_STICKER_SIZE) {
			error = new BadRequestException(
				`Either width or height of a sticker must be ${VALID_STICKER_SIZE} pixels`
			);
		}

		if (error) {
			await fileSystem.unlink(filePath);
			throw error;
		}

		return {
			fileInfo,
			meta: {
				...dimensions,
				animated
			}
		};
	}

	private async createImageStickerThumbnails(
		sticker: Upload<StickerUploadMetadata>,
		imagePath: string
	): Promise<Array<Upload<StickerUploadMetadata>>> {
		const boundarySize = sticker.meta.width;
		const sizes = STICKER_THUMBNAIL_SIZES.filter(size => size < boundarySize);

		return await mapAsync(
			sizes,
			size => this.createImageStickerThumbnail(size, imagePath, sticker)
		);
	}

	private async createImageStickerThumbnail(
		size: number,
		imagePath: string,
		sticker: Upload<StickerUploadMetadata>
	): Promise<Upload<StickerUploadMetadata>> {
		const id = new Types.ObjectId();
		const extension = sticker.extension;
		const mimeType = sticker.mimeType;
		const fileName = `${id.toHexString()}.${extension}`;
		const thumbnailPath = path.join(config.STICKERS_THUMBNAILS_DIRECTORY, fileName);
		await this.graphicsMagicService.createImageThumbnail(
			imagePath,
			thumbnailPath,
			size
		);
		const {width, height} = await this.graphicsMagicService.getImageDimensions(thumbnailPath);
		const fileStats = await fileSystem.stat(thumbnailPath);
		const thumbnail = new Upload<StickerUploadMetadata>({
			_id: id,
			size: fileStats.size,
			originalName: fileName,
			name: fileName,
			isPreview: false,
			isThumbnail: true,
			mimeType,
			extension,
			meta: {
				width,
				height,
				animated: sticker.meta.animated
			},
			type: sticker.type,
			userId: sticker.userId,
			originalId: sticker.id
		});
		await new this.uploadModel(thumbnail).save();

		return thumbnail;
	}

	private async createAnimatedWebpPreview(
		originalPath: string,
		sticker: Upload<StickerUploadMetadata>
	): Promise<Upload<ImageUploadMetadata>> {
		const id = new Types.ObjectId();
		const extension = sticker.extension;
		const name = `${id.toHexString()}.${extension}`;
		const previewPath = path.join(config.IMAGES_DIRECTORY, name);
		await this.graphicsMagicService.writeFirstFrame(
			originalPath,
			previewPath
		);
		const fileStats = await fileSystem.stat(previewPath);
		const preview = new Upload<ImageUploadMetadata>({
			_id: id,
			size: fileStats.size,
			originalName: name,
			name,
			isPreview: true,
			isThumbnail: false,
			mimeType: sticker.mimeType,
			extension,
			meta: {
				width: sticker.meta.width,
				height: sticker.meta.height
			},
			type: UploadType.IMAGE,
			userId: sticker.userId,
			originalId: sticker.id
		});
		preview.thumbnails = await this.createThumbnailsForPreview(
			preview,
			previewPath
		);
		await new this.uploadModel(preview).save();

		return preview;
	}

	private async getImageStickerThumbnailOrCreateNew(
		sticker: Upload<StickerUploadMetadata>,
		size: number
	): Promise<Upload<ImageUploadMetadata>> {
		const existingThumbnail = sticker.thumbnails.find(thumbnail => thumbnail.meta.width === size);

		if (existingThumbnail) {
			return existingThumbnail;
		}

		const imagePath = path.join(config.STICKERS_DIRECTORY, sticker.name);

		const thumbnail = await this.createImageStickerThumbnail(size, imagePath, sticker);
		sticker.thumbnails.push(thumbnail);
		await new this.uploadModel(sticker).save();

		return thumbnail;
	}

	public async uploadLottieSticker(
		file: MultipartFile,
		user: User
	): Promise<UploadResponse<StickerUploadMetadata>> {
		const id = new Types.ObjectId();
		const idString = id.toHexString();
		const tgsPath = await this.convertToTgs(idString, file);
		const sticker = new Upload<StickerUploadMetadata>({
			_id: id,
			size: 0,
			originalName: `${idString}.lottie`,
			name: `${idString}.lottie`,
			isPreview: false,
			isThumbnail: false,
			mimeType: "application/zip+dotlottie",
			extension: "lottie",
			meta: {
				width: -1,
				height: -1,
				animated: true
			},
			type: UploadType.LOTTIE_STICKER,
			userId: user.id
		});
		const preview = await this.createTgsStickerPreview(
			tgsPath,
			idString,
			sticker
		);
		sticker.previewImage = preview;
		sticker.meta = {
			...sticker.meta,
			...preview.meta
		}
		const dotLottiePath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${idString}.lottie`);
		await this.convertTgsToDotLottie(tgsPath, dotLottiePath, sticker);
		const fileStats = await fileSystem.stat(dotLottiePath);

		sticker.size = fileStats.size;
		await new this.uploadModel(sticker).save();

		return this.uploadMapper.toUploadResponse(sticker);
	}

	private async convertToTgs(id: string, file: MultipartFile): Promise<string> {
		const temporaryFilePath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.tmp`);
		await createFileFromBuffer(temporaryFilePath, file.buffer);

		let stickerFormat: LottieStickerFormat;
		let fileName: string;

		if (await this.isValidJson(temporaryFilePath)) {
			stickerFormat = "json";
			fileName = `${id}.json`;
		} else if ((await getFileType(temporaryFilePath)).ext === "zip") {
			stickerFormat = "lottie";
			fileName = `${id}.lottie`;
		} else {
			stickerFormat = "tgs";
			fileName = `${id}.tgs`;
		}

		const stickerPath = path.join(config.LOTTIE_STICKERS_DIRECTORY, fileName);
		const finalPath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.tgs`);

		await fileSystem.rename(temporaryFilePath, stickerPath);
		
		try {
			if (stickerFormat === "lottie") {
				await this.lottieService.convertDotLottieToTgs(stickerPath, finalPath, `${id}.lottie`);
			} else if (stickerFormat === "json") {
				await this.lottieService.convertJsonToTgs(stickerPath, finalPath, `${id}.json`);
			}

			await this.lottieService.checkStickerValidity(finalPath, fileName);

			if (stickerFormat !== "tgs") {
				await fileSystem.unlink(stickerPath);
			}

			return finalPath;
		} catch (error) {
			if (await exists(stickerPath)) {
				await fileSystem.unlink(stickerPath);
			}

			if (await exists(finalPath)) {
				await fileSystem.unlink(finalPath);
			}

			if (error instanceof HttpException) {
				throw error;
			} else {
				this.log.error("Unknown error occurred when tried to save lottie sticker", error);
				throw new InternalServerErrorException("Unknown error occurred when tried to save lottie sticker");
			}
		}
	}

	private async createTgsStickerPreview(
		stickerPath: string,
		stickerId: string,
		sticker: Upload<StickerUploadMetadata>
	): Promise<Upload<ImageUploadMetadata>> {
		const previewId = new Types.ObjectId();
		const previewIdString = previewId.toHexString();
		const previewPath = path.join(config.IMAGES_DIRECTORY, `${previewIdString}.png`);

		try {
			await this.lottieService.convertTgsToPng(stickerPath, previewPath, `${stickerId}.tgs`);
		} catch (error) {
			if (await exists(stickerPath)) {
				await fileSystem.unlink(stickerPath);
			}

			if (await exists(previewPath)) {
				await fileSystem.unlink(previewPath);
			}

			throw new InternalServerErrorException("Could not process sticker file");
		}

		const dimensions = await this.graphicsMagicService.getImageDimensions(previewPath);

		if (dimensions.width !== VALID_STICKER_SIZE || dimensions.height !== VALID_STICKER_SIZE) {
			await fileSystem.unlink(stickerPath);
			await fileSystem.unlink(previewPath);
			throw new BadRequestException(
				`Both width and height of a lottie sticker must be ${VALID_STICKER_SIZE} pixels`
			);
		}

		const stats = await fileSystem.stat(previewPath);
		const preview = new Upload<ImageUploadMetadata>({
			_id: previewId,
			mimeType: "image/png",
			size: stats.size,
			meta: dimensions,
			extension: "png",
			name: `${previewIdString}.png`,
			originalName: `${previewIdString}.png`,
			isPreview: true,
			isThumbnail: false,
			originalId: stickerId,
			type: UploadType.IMAGE,
			userId: sticker.userId
		});
		preview.thumbnails = await this.createThumbnailsForPreview(
			preview,
			previewPath
		);
		await new this.uploadModel(preview).save();

		return preview;
	}

	private async createThumbnailsForPreview(
		preview: Upload<ImageUploadMetadata>,
		previewPath: string
	): Promise<Array<Upload<ImageUploadMetadata>>> {
		return await mapAsync(
			STICKER_THUMBNAIL_SIZES.filter(size => size < preview.meta.width),
			async size => await this.createThumbnailForPreview(preview, previewPath, size)
		);
	}

	private async createThumbnailForPreview(
		preview: Upload<ImageUploadMetadata>,
		previewPath: string,
		size: number
	): Promise<Upload<ImageUploadMetadata>> {
		const id = new Types.ObjectId();
		const idString = id.toString();
		const name = `${idString}.${preview.extension}`;
		const thumbnailPath = path.join(config.IMAGES_THUMBNAILS_DIRECTORY, name);

		await this.graphicsMagicService.createImageThumbnail(previewPath, thumbnailPath, size);
		const dimensions = await this.graphicsMagicService.getImageDimensions(thumbnailPath);
		const stats = await fileSystem.stat(thumbnailPath);

		const thumbnail = new Upload<ImageUploadMetadata>({
			_id: id,
			mimeType: preview.mimeType,
			size: stats.size,
			name,
			extension: preview.extension,
			meta: dimensions,
			originalName: name,
			originalId: preview.id,
			isThumbnail: true,
			isPreview: false,
			type: UploadType.IMAGE,
			userId: preview.userId
		});
		await new this.uploadModel(thumbnail).save();

		return thumbnail;
	}

	private async isValidJson(filePath: PathLike): Promise<boolean> {
		try {
			const fileString = await fileSystem.readFile(filePath);
			JSON.parse(fileString.toString());
			return true;
		} catch (_) {
			return false;
		}
	}

	private async convertTgsToDotLottie(
		tgsPath: PathLike,
		dotLottiePath: PathLike,
		sticker: Upload<StickerUploadMetadata>
	): Promise<void> {
		try {
			await this.lottieService.convertTgsToDotLottie(tgsPath, dotLottiePath, sticker.name);
		} catch (error) {
			await fileSystem.unlink(tgsPath);
			await fileSystem.unlink(dotLottiePath);

			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new InternalServerErrorException();
			}
		}
	}

	public async uploadVideoSticker(
		file: MultipartFile,
		currentUser: User
	): Promise<UploadResponse<StickerUploadMetadata>> {
		const id = new Types.ObjectId();
		const idString = id.toHexString();
		const temporaryFilePath = path.join(config.VIDEO_STICKERS_DIRECTORY, `${idString}.tmp`);
		await createFileFromBuffer(temporaryFilePath, file.buffer);

		const fileInfo = await getFileType(temporaryFilePath);

		if (fileInfo.ext !== "webm") {
			await fileSystem.unlink(temporaryFilePath);
			throw new BadRequestException("Invalid video sticker format");
		}

		let videoMetadata: VideoUploadMetadata;

		try {
			videoMetadata = await this.ffmpegService.getVideoMetadata(temporaryFilePath);
		} catch (error) {
			await fileSystem.unlink(temporaryFilePath);

			if (error instanceof HttpException) {
				throw error;
			}

			this.log.error(error);

			throw new InternalServerErrorException("Could not process video sticker file");
		}

		const validationError = this.validateVideoSticker(videoMetadata);

		if (validationError) {
			await fileSystem.unlink(temporaryFilePath);
			throw new BadRequestException(validationError);
		}

		const name = `${idString}.${fileInfo.ext}`;
		const stickerPath = path.join(config.VIDEO_STICKERS_DIRECTORY, name);
		await fileSystem.rename(temporaryFilePath, stickerPath);

		const preview = await this.ffmpegService.createVideoPreview(stickerPath);
		const stats = await fileSystem.stat(stickerPath);

		const sticker = new Upload<StickerUploadMetadata>({
			_id: id,
			mimeType: fileInfo.mime,
			extension: fileInfo.ext,
			name,
			size: stats.size,
			meta: {
				width: videoMetadata.width,
				height: videoMetadata.height,
				animated: true
			},
			originalName: name,
			previewImage: preview,
			thumbnails: preview.thumbnails,
			isThumbnail: false,
			isPreview: false,
			userId: currentUser.id,
			type: UploadType.VIDEO_STICKER
		});
		await Promise.all([
			new this.uploadModel(sticker).save(),
			new this.uploadModel(preview).save(),
			...preview.thumbnails.map(thumbnail => new this.uploadModel(thumbnail).save())
		]);

		return this.uploadMapper.toUploadResponse(sticker);
	}

	private validateVideoSticker(metadata: VideoUploadMetadata): string | undefined {
		if (metadata.width !== VALID_STICKER_SIZE || metadata.height !== VALID_STICKER_SIZE) {
			return `Width or height of video sticker must me ${VALID_STICKER_SIZE} pixels`;
		}

		if (metadata.hasAudio) {
			return "Video stickers must not have audio stream";
		}

		if (metadata.duration > 3000) {
			return "Video sticker duration must not exceed 3 seconds";
		}

		if ((metadata.framerate ?? 0) > 60) {
			return "Video sticker framerate must not exceed 60 FPS";
		}

		return undefined;
	}

	public async getImageSticker(
		name: string,
		type: UploadType.IMAGE_STICKER | UploadType.WEBP_STICKER,
		response: Response,
		sizeRequest?: ImageSizeRequest
	): Promise<void> {
		const cacheKey = generateFileInfoCacheKey(name, sizeRequest?.size);
		const cachedFileInfo: RedisFileInfo | undefined = await this.cacheManager.get(cacheKey);

		if (cachedFileInfo) {
			const directory = cachedFileInfo.thumbnail
				? config.STICKERS_THUMBNAILS_DIRECTORY
				: config.STICKERS_DIRECTORY;
			response.setHeader("Content-Type", cachedFileInfo.mimeType);
			await streamFileToResponse(path.join(directory, cachedFileInfo.name), response, this.log);
			return;
		}

		const sticker = await this.uploadModel.findOne({
			name,
			type
		})
			.exec() as Upload<StickerUploadMetadata> | undefined;

		if (!sticker) {
			throw new NotFoundException(`Could not find sticker ${name}`);
		}

		response.setHeader("Content-Type", sticker.mimeType);
		let filePath: string;

		if (sizeRequest?.size && sizeRequest.size < sticker.meta.width) {
			const thumbnail = await this.getImageStickerThumbnailOrCreateNew(
				sticker,
				sizeRequest.size
			);
			const fileInfo: RedisFileInfo = {
				name: thumbnail.name,
				mimeType: thumbnail.mimeType,
				thumbnail: true
			};
			await this.cacheManager.set(cacheKey, fileInfo);
			filePath = path.join(config.STICKERS_THUMBNAILS_DIRECTORY, thumbnail.name);
		} else {
			filePath = path.join(config.STICKERS_DIRECTORY, sticker.name);
		}

		await streamFileToResponse(filePath, response, this.log);
	}

	public async getLottieSticker(name: string, response: Response): Promise<void> {
		await this.getAnimatedSticker(name, UploadType.LOTTIE_STICKER, response);
	}

	public async getVideoSticker(name: string, response: Response): Promise<void> {
		await this.getAnimatedSticker(name, UploadType.VIDEO_STICKER, response);
	}

	private async getAnimatedSticker(name: string, type: UploadType.LOTTIE_STICKER | UploadType.VIDEO_STICKER, response: Response): Promise<void> {
		response.setHeader("Cache-Control", "max-age=31536000");
		const cacheKey = generateFileInfoCacheKey(name);
		const cachedFileInfo: RedisFileInfo | undefined = await this.cacheManager.get(cacheKey);
		const directory = type === UploadType.LOTTIE_STICKER
			? config.LOTTIE_STICKERS_DIRECTORY
			: config.VIDEO_STICKERS_DIRECTORY;

		if (cachedFileInfo) {
			response.setHeader("Content-Type", cachedFileInfo.mimeType);
			await streamFileToResponse(
				path.join(directory, cachedFileInfo.name),
				response,
				this.log
			);
			return;
		}

		const sticker = await this.uploadModel.findOne({
			name,
			type
		})
			.exec();

		if (!sticker) {
			throw new NotFoundException(`Could not find sticker ${name}`);
		}

		const redisFileInfo: RedisFileInfo = {
			name,
			mimeType: sticker.mimeType,
			thumbnail: false
		};
		await this.cacheManager.set(cacheKey, redisFileInfo);

		response.setHeader("Content-Type", sticker.mimeType);

		await streamFileToResponse(path.join(directory, name), response, this.log);
	}
}