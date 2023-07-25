import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Request} from "express";
import {User} from "./types";
import {REQUIRED_ROLES} from "./constants";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    public canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[] | undefined>(REQUIRED_ROLES, context.getHandler());

        if (!roles || roles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as User | undefined;

        return user && user.roles.filter(role => roles.includes(role)).length !== 0;
    }
}
