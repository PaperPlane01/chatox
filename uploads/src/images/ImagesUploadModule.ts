import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ImagesUploadController} from "./ImagesUploadController";
import {ImagesUploadService} from "./ImagesUploadService";
import {uploadSchemaFactory, UploadsModule} from "../uploads";

@Module({
    controllers: [ImagesUploadController],
    providers: [
        ImagesUploadService
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        UploadsModule
    ]
})
export class ImagesUploadModule {}
