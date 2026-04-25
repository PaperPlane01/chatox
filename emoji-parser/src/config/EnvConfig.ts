import {Env} from "env-decorator";

export class EnvConfig {
    @Env({type: "string", required: true})
    EUREKA_HOST: string;

    @Env({type: "number", required: true})
    EUREKA_PORT: number;

    @Env({type: "string", required: false})
    EUREKA_APP_NAME = "text-parser-service";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_IP_ADDRESS = "127.0.0.1";

    @Env({type: "string", required: false})
    EUREKA_APP_INSTANCE_HOST = "localhost";

    @Env({type: "number", required: true})
    TEXT_PARSER_PORT: number;
}
