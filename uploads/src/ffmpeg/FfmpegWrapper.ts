import ffmpeg, {FfmpegCommand, FfmpegCommandOptions} from "fluent-ffmpeg";
import {Readable} from "stream";

export class FfmpegWrapper {

    public ffmpeg(input: string | Readable, options?: FfmpegCommandOptions): FfmpegCommand {
        return ffmpeg(input, options);
    }
}