import {HttpException, HttpStatus} from "@nestjs/common";

export class ChatNotFoundException extends HttpException {
    constructor(id: string) {
        super(`Could not find chat with id ${id}`, HttpStatus.NOT_FOUND);
    }
}
