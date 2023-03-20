import {Controller, Delete, Get, Param} from "@nestjs/common";
import {UploadsService} from "./UploadsService";
import {UploadResponse} from "./types/responses";
import {HasRole} from "../auth";

@Controller("api/v1/uploads")
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Get(":uploadId/info")
    public getUploadInfo(@Param("uploadId") uploadId: string): Promise<UploadResponse<any>> {
        return this.uploadsService.getUploadInfo(uploadId);
    }

    @HasRole("ROLE_ADMIN")
    @Delete(":uploadId")
    public async deleteUpload(@Param("uploadId") uploadId: string): Promise<void> {
        await this.uploadsService.deleteUpload(uploadId);
    }
}
