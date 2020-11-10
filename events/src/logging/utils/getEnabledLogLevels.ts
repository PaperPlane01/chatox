import {EnvConfig} from "../../env-config/EnvConfig";
import {LogLevel} from "@nestjs/common";

export const getEnabledLogLevels = (envConfig: EnvConfig): LogLevel[] => {
    switch (envConfig.EVENTS_SERVICE_LOG_LEVEL) {
        case "verbose":
            return ["verbose", "debug", "log", "warn", "error"];
        case "debug":
            return ["debug", "log", "warn", "error"];
        case "log":
        default:
            return ["log", "warn", "error"];
        case "warn":
            return ["warn", "error"];
        case "error":
            return ["error"];
    }
};
