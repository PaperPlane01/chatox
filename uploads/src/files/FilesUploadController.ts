import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {FilesUploadService} from "./FilesUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";


@Controller("api/v1/uploads/files")
export class FilesUploadController {
    constructor(private readonly filesUploadService: FilesUploadService) {}

    @UseInterceptors(FileInterceptor("file"))
    @Post()
    public uploadFile(@UploadedFile() file: MultipartFile,
                      @Body("originalName") originalName?: string): Promise<UploadInfoResponse<any>> {
        return this.filesUploadService.uploadFile(file, originalName);
    }

    @Get(":fileName")
    public async downloadFile(@Param("fileName") fileName: string,
                              @Res() response: Response): Promise<void> {
        await this.filesUploadService.downloadFile(fileName, response);
    }
}
