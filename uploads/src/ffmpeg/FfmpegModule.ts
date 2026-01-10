import {Module} from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import {FfmpegWrapper} from "./FfmpegWrapper";
import {FfmpegService} from "./FfmpegService";
import {config} from "../config";
import {GraphicsMagicModule} from "../graphics-magic";

@Module({
    providers: [
        {
            provide: FfmpegWrapper,
            useFactory: () => {
                ffmpeg.setFfmpegPath(config.FFMPEG_PATH);
                ffmpeg.setFfprobePath(config.FFPROBE_PATH);

                return new FfmpegWrapper();
            }
        },
        FfmpegService
    ],
    imports: [GraphicsMagicModule],
    exports: [FfmpegWrapper, FfmpegService]
})
export class FfmpegModule {

}
