import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UploadsController} from "./UploadsController";
import {UploadsService} from "./UploadsService";
import {UploadMapper} from "./mappers";
import {uploadSchemaFactory} from "./entities";

@Module({
    controllers: [UploadsController],
    providers: [
        UploadsService,
        UploadMapper
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ])
    ],
    exports: [UploadMapper, UploadsService]
})
export class UploadsModule {}
