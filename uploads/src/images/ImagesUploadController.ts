import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "@nestjs/passport";
import {Response} from "express";
import {ImagesUploadService} from "./ImagesUploadService";
import {ImageSizeRequest} from "./types/request";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {GifUploadMetadata, ImageUploadMetadata} from "../mongoose/entities";
import {config} from "../config";
import {HasAnyRole} from "../common/security";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {RolesGuard} from "../auth";

@Controller("api/v1/uploads/images")
export class ImagesUploadController {
    constructor(private readonly imagesUploadService: ImagesUploadService) {}

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @HasAnyRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
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
    public async uploadImage(@UploadedFile() file: MultipartFile): Promise<UploadInfoResponse<ImageUploadMetadata | GifUploadMetadata>> {
        return this.imagesUploadService.uploadImage(file);
    }

    @Get(":imageName")
    public async getImage(@Param("imageName") imageName: string,
                          @Query() imageSizeRequest: ImageSizeRequest,
                          @Res() response: Response): Promise<void> {
        await this.imagesUploadService.getImage(imageName, imageSizeRequest, response);
    }
}
