import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {AudiosUploadController} from "./AudiosUploadController";
import {AudiosUploadService} from "./AudiosUploadService";
import {FfmpegModule} from "../ffmpeg";
import {uploadSchemaFactory, UploadsModule} from "../uploads";

@Module({
    controllers: [AudiosUploadController],
    providers: [
        AudiosUploadService
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        FfmpegModule,
        UploadsModule
    ]
})
export class AudiosUploadModule {}
