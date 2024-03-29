import {Controller, Delete, Get, Param, Post, Res} from "@nestjs/common";
import {Response} from "express";
import {UploadsService} from "./UploadsService";
import {ArchivedUploadsService} from "./ArchivedUploadsService";
import {UploadResponse} from "./types/responses";
import {HasRole, HasScope} from "../auth";

@Controller("api/v1/uploads")
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService,
                private readonly archivedUploadsService: ArchivedUploadsService) {
    }

    @Get(":uploadId/info")
    public async getUploadInfo(@Param("uploadId") uploadId: string): Promise<UploadResponse<any>> {
        return await this.uploadsService.getUploadInfo(uploadId);
    }

    @HasRole("ROLE_ADMIN")
    @Delete(":uploadId")
    public async deleteUpload(@Param("uploadId") uploadId: string): Promise<void> {
        await this.uploadsService.scheduleUploadForDeletion(uploadId);
    }

    @HasScope("SCOPE_internal_reports_service")
    @Post(":uploadId/archive")
    public async archiveUpload(@Param("uploadId") uploadId: string): Promise<UploadResponse<any>> {
        return await this.archivedUploadsService.archiveUpload(uploadId);
    }

    @HasRole("ROLE_ADMIN")
    @Get("archived/:uploadName")
    public async getArchivedUpload(@Param("uploadName") uploadName, @Res() response: Response): Promise<void> {
        await this.archivedUploadsService.getArchivedUpload(uploadName, response);
    }
}
