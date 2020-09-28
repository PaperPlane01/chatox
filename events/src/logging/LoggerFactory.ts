import {Logger} from "@nestjs/common";

type Class = {
    new(...args: any[]): any
}

export class LoggerFactory {
    public static getLogger(clazz: Class | string): Logger {
        const context = typeof clazz === "string" ? clazz : clazz.name;
        return new Logger(context);
    }
}
