import {Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {VideosUploadService} from "./VideosUploadService";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {CurrentUser, HasRole, User} from "../auth";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {UploadResponse} from "../uploads/types/responses";
import {VideoUploadMetadata} from "../uploads";

@Controller("api/v1/uploads/videos")
export class VideosUploadController {
    constructor(private readonly videosUploadService: VideosUploadService) {}

    @HasRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
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
    public uploadVideo(@UploadedFile() multipartFile: MultipartFile, @CurrentUser() user: User): Promise<UploadResponse<VideoUploadMetadata>> {
        return this.videosUploadService.uploadVideo(multipartFile, user);
    }

    @Get(":videoName")
    public async getVideo(@Param("videoName") videoName: string,
                          @Res() response: Response): Promise<void> {
        await this.videosUploadService.getVideo(videoName, response);
    }
}
