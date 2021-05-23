import {HttpException, HttpStatus} from "@nestjs/common";

export class AccessTokenRetrievalException extends HttpException {
    constructor() {
        super("", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
