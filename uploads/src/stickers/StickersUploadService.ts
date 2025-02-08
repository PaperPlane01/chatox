import {
	BadRequestException,
	HttpException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	NotImplementedException
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
import {LottieService} from "./LottieService";
import {config} from "../config";
import {ImageUploadMetadata, StickerUploadMetadata, Upload, UploadDocument, UploadType} from "../uploads";
import {UploadMapper} from "../uploads/mappers";
import {ImageSizeRequest, MultipartFile} from "../common/types/request";
import {User} from "../auth";
import {UploadResponse} from "../uploads/types/responses";
import {createFileFromBuffer, getFileType, streamFileToResponse} from "../utils/file-utils";
import {GraphicsMagicService} from "../graphics-magic";
import {mapAsync} from "../utils/map-async";
import {generateFileInfoCacheKey} from "../utils/cache-utils";
import {RedisFileInfo} from "../common/types";

const ALLOWED_IMAGE_STICKER_FORMATS = [
	"png",
	"webp",
	"jpg"
];
const STICKER_THUMBNAIL_SIZES = [64, 128, 256];
const VALID_STICKER_SIZE = 512;

type LottieStickerFormat = "json" | "lottie";

@Injectable()
export class StickersUploadService {
	private readonly log = new Logger(StickersUploadService.name);

	constructor(
		@InjectModel(Upload.name) private readonly uploadModel: Model<UploadDocument<StickerUploadMetadata | ImageUploadMetadata>>,
		private readonly uploadMapper: UploadMapper,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Store,
		private readonly graphicsMagicService: GraphicsMagicService,
		private readonly lottieService: LottieService) {
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
	): Promise<UploadResponse<ImageUploadMetadata>> {
		const id = new Types.ObjectId();
		const idString = id.toHexString();
		const stickerPath = await this.saveLottieStickerToFileSystem(idString, file);
		const fileStats = await fileSystem.stat(stickerPath);
		const sticker = new Upload<StickerUploadMetadata>({
			_id: id,
			size: fileStats.size,
			originalName: `${idString}.lottie`,
			name: `${idString}.lottie`,
			isPreview: false,
			isThumbnail: false,
			mimeType: "application/gzip",
			extension: "lottie",
			meta: {
				width: -1,
				height: -1,
				animated: true
			},
			type: UploadType.LOTTIE_STICKER,
			userId: user.id
		});
		const preview = await this.createLottieStickerPreviewAndValidateSize(
			stickerPath,
			idString,
			sticker
		);
		sticker.previewImage = preview;
		sticker.meta = {
			...sticker.meta,
			...preview.meta
		}
		await new this.uploadModel(sticker).save();

		return this.uploadMapper.toUploadResponse(sticker);
	}

	private async saveLottieStickerToFileSystem(id: string, file: MultipartFile): Promise<string> {
		const temporaryFilePath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.tmp`);
		await createFileFromBuffer(temporaryFilePath, file.buffer);

		let stickerPath: string;
		let stickerFormat: LottieStickerFormat;

		if (await this.isValidJson(temporaryFilePath)) {
			stickerPath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.json`);
			stickerFormat = "json";
		} else {
			stickerPath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.lottie`);
			stickerFormat = "lottie";
		}

		await fileSystem.rename(temporaryFilePath, stickerPath);

		let finalPath = stickerPath;

		try {
			if (stickerFormat === "json") {
				finalPath = path.join(config.LOTTIE_STICKERS_DIRECTORY, `${id}.lottie`);
				await this.lottieService.convertJsonToLottie(stickerPath, finalPath);
			}

			return finalPath;
		} catch (error) {
			await fileSystem.unlink(stickerPath);

			if (error instanceof HttpException) {
				throw error;
			} else {
				this.log.error("Unknown error occurred when tried to save lottie sticker", error);
				throw new InternalServerErrorException("Unknown error occurred when tried to save lottie sticker");
			}
		}
	}

	private async createLottieStickerPreviewAndValidateSize(
		stickerPath: string,
		stickerId: string,
		sticker: Upload<StickerUploadMetadata>
	): Promise<Upload<ImageUploadMetadata>> {
		const previewId = new Types.ObjectId();
		const previewIdString = previewId.toHexString();
		const previewPath = path.join(config.IMAGES_DIRECTORY, `${previewIdString}.png`);
		await this.lottieService.createPng(stickerPath, previewPath);

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

	public async uploadVideoSticker(
		file: MultipartFile
	): Promise<UploadResponse<ImageUploadMetadata>> {
		throw new NotImplementedException("Video stickers are not yet supported");
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
		throw new NotImplementedException("Lottie stickers are not yet supported");
	}

	public async getVideoSticker(id: string, response: Response): Promise<void> {
		throw new NotImplementedException("Video stickers are not yet supported");
	}
}