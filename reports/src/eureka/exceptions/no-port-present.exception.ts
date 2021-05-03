import {HttpException, HttpStatus} from "@nestjs/common";

export class NoPortPresentException extends HttpException {
    constructor() {
        super("", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
