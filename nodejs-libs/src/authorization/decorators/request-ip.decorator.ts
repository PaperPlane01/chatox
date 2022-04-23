import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";

export const RequestIp = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();

        if (request.header("x-forwarded-for")) {
            return request.header("x-forwarded-for");
        } else {
            return request.ip;
        }
    }
);
