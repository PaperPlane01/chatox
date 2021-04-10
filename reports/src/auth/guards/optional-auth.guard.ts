import {Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {OPTIONAL_JWT_STRATEGY} from "../constants";

@Injectable()
export class OptionalAuthGuard extends AuthGuard(OPTIONAL_JWT_STRATEGY) {
    
    handleRequest(err, user, info) {
        if (info && info.name === "TokenExpiredError") {
            throw new UnauthorizedException("JWT expired");
        }

        return user;
    }
}
