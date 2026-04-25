import {Controller, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {StickersUploadService} from "./StickersUploadService";
import {CurrentUser, HasRole, User} from "../auth";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {config} from "../config";
import {UploadResponse} from "../uploads/types/responses";
import {StickerUploadMetadata, UploadType} from "../uploads";
import {ImageSizeRequest, MultipartFile} from "../common/types/request";

@Controller("api/v1/uploads/stickers")
export class StickersUploadController {
	constructor(private readonly stickersUploadService: StickersUploadService) {
	}

	@HasRole("ROLE_USER")
	@UseInterceptors(
		RejectEmptyInterceptor,
		FileInterceptor(
			"file",
			{
				limits: {
					fileSize: config.IMAGE_MAX_SIZE_BYTES
				}
			}
		)
	)
	@Post("image")
	public async uploadSticker(@UploadedFile() file: MultipartFile,
							   @CurrentUser() currentUser: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.stickersUploadService.uploadImageSticker(file, currentUser);
	}

	@HasRole("ROLE_USER")
	@UseInterceptors(
		RejectEmptyInterceptor,
		FileInterceptor(
			"file",
			{
				limits: {
					fileSize: config.WEBP_STICKER_MAX_SIZE_BYTES
				}
			}
		)
	)
	@Post("webp")
	public async uploadWebpSticker(@UploadedFile() file: MultipartFile,
								   @CurrentUser() currentUser: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.stickersUploadService.uploadWebpSticker(file, currentUser);
	}

	@Get("image/:stickerName")
	public async getImageSticker(
		@Param("stickerName") stickerName: string,
		@Query() sizeRequest: ImageSizeRequest,
		@Res() response: Response
	): Promise<void> {
		await this.stickersUploadService.getImageSticker(
			stickerName,
			UploadType.IMAGE_STICKER,
			response,
			sizeRequest
		);
	}

	@Get("webp/:stickerName")
	public async getWebpSticker(
		@Param("stickerName") stickerName: string,
		@Query() sizeRequest: ImageSizeRequest,
		@Res() response: Response
	): Promise<void> {
		await this.stickersUploadService.getImageSticker(
			stickerName,
			UploadType.WEBP_STICKER,
			response,
			sizeRequest
		);
	}

	@HasRole("ROLE_USER")
	@UseInterceptors(
		RejectEmptyInterceptor,
		FileInterceptor(
			"file",
			{
				limits: {
					fileSize: config.LOTTIE_STICKER_MAX_SIZE_BYTES
				}
			}
		)
	)
	@Post("lottie")
	public async uploadLottieSticker(@UploadedFile() file: MultipartFile,
									 @CurrentUser() user: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.stickersUploadService.uploadLottieSticker(file, user);
	}

	@Get("lottie/:stickerName")
	public async getLottieSticker(
		@Param("stickerName") name: string,
		@Res() response: Response
	): Promise<void> {
		await this.stickersUploadService.getLottieSticker(name, response);
	}

	@HasRole("ROLE_USER")
	@UseInterceptors(
		RejectEmptyInterceptor,
		FileInterceptor(
			"file",
			{
				limits: {
					fileSize: config.VIDEO_STICKERS_MAX_SIZE_BYTES
				}
			}
		)
	)
	@Post("video")
	public async uploadVideoSticker(@UploadedFile() file: MultipartFile,
									@CurrentUser() user: User): Promise<UploadResponse<StickerUploadMetadata>> {
		return await this.stickersUploadService.uploadVideoSticker(file, user);
	}

	@Get("video/:stickerName")
	public async getVideoSticker(@Param("stickerName") name: string,
								 @Res() response: Response): Promise<void> {
		await this.stickersUploadService.getVideoSticker(name, response);
	}
}