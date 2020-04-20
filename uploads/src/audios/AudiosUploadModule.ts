import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {AudiosUploadController} from "./AudiosUploadController";
import {AudiosUploadService} from "./AudiosUploadService";
import {UploadMapper} from "../common/mappers";
import {UploadSchema} from "../mongoose/schemas";

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
        MongooseModule.forFeature([
            {
                name: "upload",
                schema: UploadSchema
            }
        ])
    ]
})
export class AudiosUploadModule {}
