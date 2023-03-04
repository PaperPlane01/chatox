import {Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "@nestjs/passport";
import {Response} from "express";
import {VideosUploadService} from "./VideosUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {VideoUploadMetadata} from "../mongoose/entities";
import {config} from "../config";
import {RolesGuard} from "../auth";
import {HasAnyRole} from "../common/security";
import {RejectEmptyInterceptor} from "../common/interceptors";

@Controller("api/v1/uploads/videos")
export class VideosUploadController {
    constructor(private readonly videosUploadService: VideosUploadService) {}

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @HasAnyRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
    @UseInterceptors(
        RejectEmptyInterceptor,
        FileInterceptor(
            "file",
            {
                limits: {
                    fileSize: config.VIDEO_MAX_SIZE_BYTES
                }
            }
        )
    )
    @Post()
    public uploadVideo(@UploadedFile() multipartFile: MultipartFile): Promise<UploadInfoResponse<VideoUploadMetadata>> {
        return this.videosUploadService.uploadVideo(multipartFile);
    }

    @Get(":videoName")
    public async getVideo(@Param("videoName") videoName: string,
                          @Res() response: Response): Promise<void> {
        await this.videosUploadService.getVideo(videoName, response);
    }
}
