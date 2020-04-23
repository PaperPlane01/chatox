import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {config} from "../config";
import {CurrentUser, JwtPayload} from "./types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.JWT_PUBLIC_KEY
        })
    }

    public validate(payload?: JwtPayload): CurrentUser {
        if (!payload) {
            throw new UnauthorizedException();
        }

        return {
            id: payload.user_id,
            accountId: payload.account_id,
            roles: payload.authorities,
            scope: payload.scope,
            username: payload.user_name
        };
    }
}
