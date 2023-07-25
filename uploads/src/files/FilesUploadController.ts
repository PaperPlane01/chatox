import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {Response} from "express";
import {FilesUploadService} from "./FilesUploadService";
import {MultipartFile} from "../common/types/request";
import {config} from "../config";
import {CurrentUser, HasRole, User} from "../auth";
import {RejectEmptyInterceptor} from "../common/interceptors";
import {UploadResponse} from "../uploads/types/responses";

@Controller("api/v1/uploads/files")
export class FilesUploadController {
    constructor(private readonly filesUploadService: FilesUploadService) {}

    @HasRole("ROLE_USER", "ROLE_ANONYMOUS_USER")
    @UseInterceptors(
        RejectEmptyInterceptor,
        FileInterceptor(
            "file",
            {
                limits: {
                    fileSize: config.FILE_MAX_SIZE_BYTES
                }
            }
        )
    )
    @Post()
    public uploadFile(@UploadedFile() file: MultipartFile,
                      @CurrentUser() currentUser: User,
                      @Body("originalName") originalName?: string): Promise<UploadResponse<any>> {
        return this.filesUploadService.uploadFile(file, currentUser, originalName);
    }

    @Get(":fileName")
    public async downloadFile(@Param("fileName") fileName: string,
                              @Res() response: Response): Promise<void> {
        await this.filesUploadService.downloadFile(fileName, response);
    }
}
