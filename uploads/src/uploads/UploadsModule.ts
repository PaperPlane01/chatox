import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UploadsController} from "./UploadsController";
import {UploadsService} from "./UploadsService";
import {UploadMapper} from "../common/mappers";
import {uploadSchemaFactory} from "../mongoose/schemas";

@Module({
    controllers: [UploadsController],
    providers: [
        UploadsService,
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
export class UploadsModule {}
