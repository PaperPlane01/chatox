import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {UploadMapper} from "../common/mappers";
import {Upload} from "../mongoose/entities";
import {UploadInfoResponse} from "../common/types/response";

@Injectable()
export class UploadsService {
    constructor(@InjectModel("upload") private readonly uploadModel: Model<Upload<any>>,
                private readonly uploadMapper: UploadMapper) {

    }

    public async getUploadInfo(uploadId: string): Promise<UploadInfoResponse<any>> {
        const upload = await this.uploadModel.findOne({
            id: uploadId
        })
            .exec();

        if (!upload) {
            throw new HttpException(
                `Could not find upload with id ${uploadId}`,
                HttpStatus.NOT_FOUND
            )
        }

        return this.uploadMapper.toUploadInfoResponse(upload);
    }
}
