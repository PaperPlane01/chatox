import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Request} from "express";
import {User} from "./types";
import {REQUIRED_SCOPES} from "./constants";

@Injectable()
export class ScopesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean  {
        const scopes = this.reflector.get<string[] | undefined>(REQUIRED_SCOPES, context.getHandler());

        if (!scopes || scopes.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as User | undefined;

        return user && user.scope.filter(scope => scopes.includes(scope)).length !== 0;
    }

}