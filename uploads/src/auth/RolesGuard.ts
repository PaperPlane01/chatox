import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {Reflector} from "@nestjs/core";
import {Request} from "express";
import {CurrentUser} from "./types";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get("roles", context.getHandler()) as string[] | undefined;

        if (!roles || roles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as CurrentUser | undefined;

        return user && user.roles.filter(role => roles.includes(role)).length !== 0;
    }
}
