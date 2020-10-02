import {Logger, LogLevel} from "@nestjs/common";
import {getEnabledLogLevels} from "./utils";
import {config} from "../env-config";

export class CustomLogger extends Logger {
    public consoleLog(data: any, requiredLogLevel: LogLevel = "verbose"): void {
        if (this.shouldLog(requiredLogLevel)) {
            console.log(data);
        }
    }

    private shouldLog(requiredLogLevel: LogLevel): boolean {
        return getEnabledLogLevels(config).includes(requiredLogLevel);
    }
}
