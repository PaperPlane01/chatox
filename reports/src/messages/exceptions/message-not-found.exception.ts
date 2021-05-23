import {HttpException, HttpStatus} from "@nestjs/common";

export class MessageNotFoundException extends HttpException {
    constructor(messageId: string) {
        super(`Could not find message with id ${messageId}`, HttpStatus.NOT_FOUND);
    }
}
