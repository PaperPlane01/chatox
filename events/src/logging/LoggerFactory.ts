import {CustomLogger} from "./CustomLogger";

type Class = {
    new(...args: any[]): any
}

export class LoggerFactory {
    public static getLogger(clazz: Class | string): CustomLogger {
        const context = typeof clazz === "string" ? clazz : clazz.name;
        return new CustomLogger(context);
    }
}
