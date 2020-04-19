import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {VideosUploadController} from "./VideosUploadController";
import {VideosUploadService} from "./VideosUploadService";
import {UploadMapper} from "../common/mappers";
import {UploadSchema} from "../mongoose/schemas";

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
        MongooseModule.forFeature([
            {
                name: "upload",
                schema: UploadSchema
            }
        ])
    ]
})
export class VideosUploadModule {}
