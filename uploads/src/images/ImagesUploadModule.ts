import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ImagesUploadController} from "./ImagesUploadController";
import {ImagesUploadService} from "./ImagesUploadService";
import {uploadSchemaFactory} from "../mongoose/schemas";
import {UploadMapper} from "../common/mappers";

@Module({
    controllers: [ImagesUploadController],
    providers: [
        ImagesUploadService,
        {
            provide: UploadMapper,
            useValue: new UploadMapper()
        }
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ])
    ]
})
export class ImagesUploadModule {}
