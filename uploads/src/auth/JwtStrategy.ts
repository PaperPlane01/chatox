import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {User, JwtPayload, isUserRole} from "./types";
import {JWT_STRATEGY} from "./constants";
import {config} from "../config";

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
            roles: payload.authorities.filter(isUserRole),
            scope: payload.scope,
            username: payload.user_name
        };
    }
}
