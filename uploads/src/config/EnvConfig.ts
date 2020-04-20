import {Env} from "env-decorator";

export class EnvConfig {
    @Env({type: "string", required: true})
    IMAGES_DIRECTORY: string;

    @Env({type: "string", required: true})
    IMAGES_THUMBNAILS_DIRECTORY: string;

    @Env({type: "number", required: false})
    IMAGE_MAX_SIZE_BYTES: number = 10485760; // 10 megabytes by default

    @Env({type: "string", required: true})
    VIDEOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    VIDEO_MAX_SIZE_BYTES: number = 524288000; // 500 megabytes by default

    @Env({type: "string", required: true})
    AUDIOS_DIRECTORY: string;

    @Env({type: "number", required: false})
    AUDIO_MAX_SIZE_BYTES: number = 31457280; // 30 megabytes default

    @Env({type: "string", required: true})
    FILES_DIRECTORY: string;

    @Env({type: "number", required: false})
    FILE_MAX_SIZE_BYTES: number = 1073741824; // 1 gigabyte default

    @Env({type: "string", required: true})
    MONGODB_HOST: string;

    @Env({type: "string", required: true})
    MONGODB_PORT: string;

    @Env({type: "string", required: true})
    MONGODB_DATABASE_NAME: string;

    @Env({type: "number", required: true})
    PORT: number;

    @Env({type: "string", required: true})
    EUREKA_HOST: string;

    @Env({type: "number", required: true})
    EUREKA_PORT: number;

    @Env({type: "string", required: false})
    EUREKA_APP_NAME: string = "uploads-service";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_IP_ADDRESS: string = "127.0.0.1";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_HOST: string = "localhost";
}
