import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UploadReference, UploadReferenceSchema} from "./entities";
import {
    UploadReferenceChatsEventsListener,
    UploadReferenceMessagesEventsListener,
    UploadReferenceStickersEventsListener,
    UploadReferenceUsersEventsListener
} from "./events";
import {UploadReferenceDeletionChecker} from "./UploadReferenceDeletionChecker";
import {uploadSchemaFactory, UploadsModule} from "../uploads";

@Module({
    providers: [
        UploadReferenceChatsEventsListener,
        UploadReferenceMessagesEventsListener,
        UploadReferenceUsersEventsListener,
        UploadReferenceStickersEventsListener,
        UploadReferenceDeletionChecker
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: UploadReference.name,
                useFactory: () => UploadReferenceSchema
            },
            uploadSchemaFactory
        ]),
        UploadsModule
    ]
})
export class UploadReferenceModule {}
