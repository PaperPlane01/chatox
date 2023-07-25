import {Controller, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {ImagesUploadService} from "./ImagesUploadService";
import {ImageSizeRequest} from "./types/request";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {CurrentUser, HasRole, User} from "../auth";
import {UploadResponse} from "../uploads/types/responses";
import {GifUploadMetadata, ImageUploadMetadata} from "../uploads";

@Controller("api/v1/uploads/images")
export class ImagesUploadController {
    constructor(private readonly imagesUploadService: ImagesUploadService) {}

    @HasRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
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
    @Post()
    public async uploadImage(@UploadedFile() file: MultipartFile,
                             @CurrentUser() currentUser: User): Promise<UploadResponse<ImageUploadMetadata | GifUploadMetadata>> {
        return this.imagesUploadService.uploadImage(file, currentUser);
    }

    @Get(":imageName")
    public async getImage(@Param("imageName") imageName: string,
                          @Query() imageSizeRequest: ImageSizeRequest,
                          @Res() response: Response): Promise<void> {
        await this.imagesUploadService.getImage(imageName, imageSizeRequest, response);
    }
}
