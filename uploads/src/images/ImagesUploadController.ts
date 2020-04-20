import {Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {ImagesUploadService} from "./ImagesUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {GifUploadMetadata, ImageUploadMetadata} from "../mongoose/entities";
import {config} from "../config";

@Controller("api/v1/uploads/images")
export class ImagesUploadController {
    constructor(private readonly imagesUploadService: ImagesUploadService) {}

    @UseInterceptors(FileInterceptor(
        "file",
        {
            limits: {
                fileSize: config.IMAGE_MAX_SIZE_BYTES
            }
        }
    ))
    @Post()
    public async uploadImage(@UploadedFile() file: MultipartFile): Promise<UploadInfoResponse<ImageUploadMetadata | GifUploadMetadata>> {
        return this.imagesUploadService.uploadImage(file);
    }

    @Get(":imageName")
    public async getImage(@Param("imageName") imageName: string,
                          @Res() response: Response): Promise<void> {
        await this.imagesUploadService.getImage(imageName, response);
    }
}
