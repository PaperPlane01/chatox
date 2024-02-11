import {Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Request, Response} from "express";
import {AudiosUploadService} from "./AudiosUploadService";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {CurrentUser, HasRole, User} from "../auth";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {UploadResponse} from "../uploads/types/responses";
import {AudioUploadMetadata} from "../uploads";

@Controller("api/v1/uploads/audios")
export class AudiosUploadController {
    constructor(private readonly audioUploadService: AudiosUploadService) {}

    @HasRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
    @UseInterceptors(
        RejectEmptyInterceptor,
        FileInterceptor(
            "file",
            {
                limits: {
                    fileSize: config.AUDIO_MAX_SIZE_BYTES
                }
            })
    )
    @Post()
    public uploadAudio(@UploadedFile() multipartFile: MultipartFile,
                       @CurrentUser() currentUser: User,
                       @Body("originalName") originalName?: string
    ): Promise<UploadResponse<AudioUploadMetadata>> {
        return this.audioUploadService.uploadAudio(
            multipartFile,
            currentUser,
            false,
            originalName
        );
    }

    @HasRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
    @UseInterceptors(
        RejectEmptyInterceptor,
        FileInterceptor(
            "file",
            {
                limits: {
                    fileSize: config.AUDIO_MAX_SIZE_BYTES
                }
            })
    )
    @Post("voice")
    public uploadVoiceMessage(@UploadedFile() multipartFile: MultipartFile,
                              @CurrentUser() currentUser: User
    ): Promise<UploadResponse<AudioUploadMetadata>> {
        return this.audioUploadService.uploadAudio(
            multipartFile,
            currentUser,
            true
        );
    }

    @Get(":audioName")
    public async getAudio(@Param("audioName") audioName: string,
                          @Res() response: Response): Promise<void> {
        await this.audioUploadService.getAudio(audioName, response);
    }

    @Get(":audioName/download")
    public async downloadAudio(@Param("audioName") audioName: string,
                               @Res() response: Response): Promise<void> {
        await this.audioUploadService.downloadAudio(audioName, response);
    }

    @Get(":audioName/stream")
    public async streamAudio(@Param("audioName") audioName: string,
                             @Req() request: Request,
                             @Res() response: Response): Promise<void> {
        await this.audioUploadService.streamAudio(audioName, request, response);
    }
}
