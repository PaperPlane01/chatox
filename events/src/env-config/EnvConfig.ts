import {Env} from "env-decorator";
import {LogLevel} from "@nestjs/common";

export class EnvConfig {
    @Env({type: "number", required: true})
    EVENTS_SERVICE_PORT: number;

    @Env({type: "string", required: true})
    RABBITMQ_USERNAME: string;

    @Env({type: "string", required: true})
    RABBITMQ_PASSWORD: string;

    @Env({type: "string", required: true})
    RABBITMQ_HOST: string;

    @Env({type: "number", required: true})
    RABBITMQ_PORT: number;

    @Env({type: "string", required: false})
    EVENTS_SERVICE_LOG_LEVEL: LogLevel = "log";

    @Env({type: "string", required: true})
    MONGODB_HOST: string;

    @Env({type: "number", required: true})
    MONGODB_PORT: string;

    @Env({type: "string", required: true})
    EVENTS_SERVICE_DATABASE_NAME: string;

    @Env({type: "string", required: false})
    EVENTS_SERVICE_EUREKA_APP_NAME: string = "events-service";

    @Env({type: "string", required: false})
    EUREKA_HOST: string = "localhost";

    @Env({type: "number", required: false})
    EUREKA_PORT: number = 8081;
}
