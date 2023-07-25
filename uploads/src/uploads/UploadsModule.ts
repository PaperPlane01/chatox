import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UploadsController} from "./UploadsController";
import {UploadsService} from "./UploadsService";
import {ArchivedUploadsService} from "./ArchivedUploadsService";
import {UploadDeletionChecker} from "./UploadDeletionChecker";
import {UploadMapper} from "./mappers";
import {ArchivedUpload, ArchivedUploadSchema, uploadSchemaFactory} from "./entities";
import {UploadEventsPublisher} from "./events";
import {UploadReference, UploadReferenceSchema} from "../upload-references/entities";

@Module({
    controllers: [UploadsController],
    providers: [
        UploadsService,
        UploadMapper,
        UploadDeletionChecker,
        ArchivedUploadsService,
        UploadEventsPublisher
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory,
            {
                name: ArchivedUpload.name,
                useFactory: () => ArchivedUploadSchema
            },
            {
                name: UploadReference.name,
                useFactory: () => UploadReferenceSchema
            }
        ])
    ],
    exports: [UploadMapper, UploadsService, UploadEventsPublisher]
})
export class UploadsModule {}
