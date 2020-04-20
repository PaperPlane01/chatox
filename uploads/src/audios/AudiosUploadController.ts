import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {AudiosUploadService} from "./AudiosUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {AudioUploadMetadata} from "../mongoose/entities";

@Controller("api/v1/uploads/audios")
export class AudiosUploadController {
    constructor(private readonly audioUploadService: AudiosUploadService) {}

    @UseInterceptors(FileInterceptor("file"))
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
}
