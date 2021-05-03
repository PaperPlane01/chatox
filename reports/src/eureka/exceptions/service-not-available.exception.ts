import {HttpException, HttpStatus} from "@nestjs/common";

export class ServiceNotAvailableException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
