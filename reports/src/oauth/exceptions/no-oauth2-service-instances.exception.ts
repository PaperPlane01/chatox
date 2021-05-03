import {HttpException, HttpStatus} from "@nestjs/common";

export class NoOauth2ServiceInstancesException extends HttpException {
    constructor() {
        super("No OAuth2 service instances are available", HttpStatus.SERVICE_UNAVAILABLE);
    }
}
