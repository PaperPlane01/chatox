import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {VideosUploadController} from "./VideosUploadController";
import {VideosUploadService} from "./VideosUploadService";
import {FfmpegModule} from "../ffmpeg";
import {uploadSchemaFactory, UploadsModule} from "../uploads";

@Module({
    controllers: [VideosUploadController],
    providers: [
        VideosUploadService
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        FfmpegModule,
        UploadsModule
    ]
})
export class VideosUploadModule {}
