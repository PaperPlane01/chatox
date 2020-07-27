import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {RolesGuard} from "./RolesGuard";
import {JwtStrategy} from "./JwtStrategy";

@Module({
    providers: [RolesGuard, JwtStrategy],
    imports: [PassportModule]
})
export class AuthModule {}
