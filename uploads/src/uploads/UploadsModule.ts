import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UploadsController} from "./UploadsController";
import {UploadsService} from "./UploadsService";
import {UploadMapper} from "../common/mappers";
import {UploadSchema} from "../mongoose/schemas";

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
        MongooseModule.forFeature([
            {
                name: "upload",
                schema: UploadSchema
            }
        ])
    ]
})
export class UploadsModule {}
