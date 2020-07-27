import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {FilesUploadController} from "./FilesUploadController";
import {FilesUploadService} from "./FilesUploadService";
import {UploadMapper} from "../common/mappers";
import {uploadSchemaFactory} from "../mongoose/schemas";

@Module({
    controllers: [FilesUploadController],
    providers: [
        FilesUploadService,
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
export class FilesModule {}
