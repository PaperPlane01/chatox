import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {StickersUploadController} from "./StickersUploadController";
import {StickersUploadService} from "./StickersUploadService";
import {uploadSchemaFactory, UploadsModule} from "../uploads";
import {GraphicsMagicModule} from "../graphics-magic";
import {LottieModule} from "../lottie";
import {FfmpegModule} from "../ffmpeg";

@Module({
	controllers: [StickersUploadController],
	providers: [StickersUploadService],
	imports: [
		MongooseModule.forFeatureAsync([uploadSchemaFactory]),
		UploadsModule,
		GraphicsMagicModule,
		LottieModule,
		FfmpegModule
	]
})
export class StickersUploadModule {

}