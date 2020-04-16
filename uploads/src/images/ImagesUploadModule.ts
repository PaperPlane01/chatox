import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ImagesUploadController} from "./ImagesUploadController";
import {ImagesUploadService} from "./ImagesUploadService";
import {UploadSchema} from "../mongoose/schemas";
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
        MongooseModule.forFeature([
            {
                name: "upload",
                schema: UploadSchema
            }
        ]),
    ]
})
export class ImagesUploadModule {}
