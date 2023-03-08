import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {AudiosUploadController} from "./AudiosUploadController";
import {AudiosUploadService} from "./AudiosUploadService";
import {UploadMapper} from "../common/mappers";
import {uploadSchemaFactory} from "../mongoose/schemas";
import {FfmpegModule} from "../ffmpeg";

@Module({
    controllers: [AudiosUploadController],
    providers: [
        AudiosUploadService,
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
export class AudiosUploadModule {}
