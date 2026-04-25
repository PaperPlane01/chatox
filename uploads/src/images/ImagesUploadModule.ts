import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ImagesUploadController} from "./ImagesUploadController";
import {ImagesUploadService} from "./ImagesUploadService";
import {uploadSchemaFactory, UploadsModule} from "../uploads";
import {GraphicsMagicModule} from "../graphics-magic";

@Module({
    controllers: [ImagesUploadController],
    providers: [
        ImagesUploadService
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        UploadsModule,
        GraphicsMagicModule
    ]
})
export class ImagesUploadModule {}
