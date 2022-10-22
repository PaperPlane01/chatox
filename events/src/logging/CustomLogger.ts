import {Logger, LogLevel} from "@nestjs/common";
import {getEnabledLogLevels} from "./utils";
import {config} from "../env-config";

class InternalLogger extends Logger {
    protected static initLogLevel() {
        this.logLevels = getEnabledLogLevels(config);
    }

    public consoleLog(data: any, requiredLogLevel: LogLevel = "verbose"): void {
        if (this.shouldLog(requiredLogLevel)) {
            console.log(data);
        }
    }

    private shouldLog(requiredLogLevel: LogLevel): boolean {
        return getEnabledLogLevels(config).includes(requiredLogLevel);
    }
}

export class CustomLogger extends InternalLogger {
    constructor(context?: string) {
        super(context);
        CustomLogger.initLogLevel();
    }
}
