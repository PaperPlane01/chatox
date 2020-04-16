import {Controller, Get, Param} from "@nestjs/common";
import {UploadInfoResponse} from "../common/types/response";
import {UploadsService} from "./UploadsService";

@Controller("api/v1/uploads")
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Get(":uploadId/info")
    public getUploadInfo(@Param("uploadId") uploadId: string): Promise<UploadInfoResponse<any>> {
        return this.uploadsService.getUploadInfo(uploadId);
    }
}
