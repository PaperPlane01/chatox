import {Env} from "env-decorator";

export class EnvConfig {
    @Env({type: "string"})
    IMAGES_DIRECTORY: string;

    @Env({type: "string"})
    IMAGES_THUMBNAILS_DIRECTORY: string;

    @Env({type: "string"})
    MONGODB_HOST: string;

    @Env({type: "string"})
    MONGODB_PORT: string;

    @Env({type: "string"})
    MONGODB_DATABASE_NAME: string;

    @Env({type: "number"})
    PORT: number;

    @Env({type: "string"})
    EUREKA_HOST: string;

    @Env({type: "number"})
    EUREKA_PORT: number;

    @Env({type: "string", required: false})
    EUREKA_APP_NAME: string = "uploads-service";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_IP_ADDRESS: string = "127.0.0.1";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_HOST: string = "localhost";
}
