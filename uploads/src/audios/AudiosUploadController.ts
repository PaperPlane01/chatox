import {Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "@nestjs/passport";
import {Request, Response} from "express";
import {AudiosUploadService} from "./AudiosUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {AudioUploadMetadata} from "../mongoose/entities";
import {config} from "../config";
import {RolesGuard} from "../auth";
import {HasAnyRole} from "../common/security";

@Controller("api/v1/uploads/audios")
export class AudiosUploadController {
    constructor(private readonly audioUploadService: AudiosUploadService) {}

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @HasAnyRole("ROLE_USER")
    @UseInterceptors(FileInterceptor(
        "file",
        {
            limits: {
                fileSize: config.AUDIO_MAX_SIZE_BYTES
            }
        })
    )
    @Post()
    public uploadAudio(@UploadedFile() multipartFile: MultipartFile,
                       @Body("originalName") originalName?: string): Promise<UploadInfoResponse<AudioUploadMetadata>> {
        return this.audioUploadService.uploadAudio(multipartFile, originalName);
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
