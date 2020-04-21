import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "@nestjs/passport";
import {Response} from "express";
import {FilesUploadService} from "./FilesUploadService";
import {MultipartFile} from "../common/types/request";
import {UploadInfoResponse} from "../common/types/response";
import {config} from "../config";
import {RolesGuard} from "../auth";
import {HasAnyRole} from "../common/security";

@Controller("api/v1/uploads/files")
export class FilesUploadController {
    constructor(private readonly filesUploadService: FilesUploadService) {}

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @HasAnyRole("ROLE_USER")
    @UseInterceptors(FileInterceptor(
        "file",
        {
            limits: {
                fileSize: config.FILE_MAX_SIZE_BYTES
            }
        }
    ))
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
