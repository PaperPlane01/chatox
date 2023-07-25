import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {FilesUploadController} from "./FilesUploadController";
import {FilesUploadService} from "./FilesUploadService";
import {uploadSchemaFactory, UploadsModule} from "../uploads";

@Module({
    controllers: [FilesUploadController],
    providers: [
        FilesUploadService
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        UploadsModule
    ]
})
export class FilesModule {}
