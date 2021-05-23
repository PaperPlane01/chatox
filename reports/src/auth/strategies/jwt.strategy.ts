import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {JWT_STRATEGY} from "../constants";
import {JwtPayload} from "../types/jwt-payload";
import {UserRole} from "../types/user-role";
import {User} from "../types/user";
import {config} from "../../config/env.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.JWT_PUBLIC_KEY
        })
    }

    public validate(payload?: JwtPayload): User {
        if (!payload) {
            throw new UnauthorizedException();
        }

        return {
            id: payload.user_id,
            accountId: payload.account_id,
            roles: payload.authorities as UserRole[],
            scope: payload.scope,
            userName: payload.user_name
        };
    }
}
