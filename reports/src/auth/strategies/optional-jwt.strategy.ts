import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {OPTIONAL_JWT_STRATEGY} from "../constants";
import {JwtPayload} from "../types/jwt-payload";
import {User} from "../types/user";
import {UserRole} from "../types/user-role";
import {config} from "../../config/env.config";

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(Strategy, OPTIONAL_JWT_STRATEGY) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.JWT_PUBLIC_KEY
        });
    }

    public async validate(payload?: JwtPayload): Promise<User | null> {
        if (!payload) {
            return null;
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
