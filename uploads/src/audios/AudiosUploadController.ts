import {Body, Controller, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
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
}
