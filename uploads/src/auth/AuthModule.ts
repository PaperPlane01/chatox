import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {RolesGuard} from "./RolesGuard";
import {JwtStrategy} from "./JwtStrategy";
import {ScopesGuard} from "./ScopesGuard";

@Module({
    providers: [RolesGuard, ScopesGuard, JwtStrategy],
    imports: [PassportModule]
})
export class AuthModule {}
