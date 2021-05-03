import {HttpException, HttpStatus} from "@nestjs/common";

export class UserNotFoundException extends HttpException {
    constructor(userId: string) {
        super(`Could not find user with id ${userId}`, HttpStatus.NOT_FOUND);
    }
}
