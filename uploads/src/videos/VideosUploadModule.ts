import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {VideosUploadController} from "./VideosUploadController";
import {VideosUploadService} from "./VideosUploadService";
import {UploadMapper} from "../common/mappers";
import {uploadSchemaFactory} from "../mongoose/schemas";
import {FfmpegModule} from "../ffmpeg";

@Module({
    controllers: [VideosUploadController],
    providers: [
        VideosUploadService,
        {
            provide: UploadMapper,
            useValue: new UploadMapper()
        }
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        FfmpegModule
    ]
})
export class VideosUploadModule {}
