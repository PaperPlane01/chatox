import {Module} from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import {FfmpegWrapper} from "./FfmpegWrapper";
import {config} from "../config";

@Module({
    providers: [
        {
            provide: FfmpegWrapper,
            useFactory: () => {
                ffmpeg.setFfmpegPath(config.FFMPEG_PATH);
                ffmpeg.setFfprobePath(config.FFPROBE_PATH);

                return new FfmpegWrapper();
            }
        }
    ],
    exports: [FfmpegWrapper]
})
export class FfmpegModule {

}