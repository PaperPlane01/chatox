import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {StickersUploadController} from "./StickersUploadController";
import {StickersUploadService} from "./StickersUploadService";
import {LottieService} from "./LottieService";
import {uploadSchemaFactory, UploadsModule} from "../uploads";
import {GraphicsMagicModule} from "../graphics-magic";

@Module({
	controllers: [StickersUploadController],
	providers: [StickersUploadService, LottieService],
	imports: [
		MongooseModule.forFeatureAsync([uploadSchemaFactory]),
		UploadsModule,
		GraphicsMagicModule
	]
})
export class StickersUploadModule {

}