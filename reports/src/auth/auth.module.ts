import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {HasRoleGuard} from "./guards/has-role.guard";
import {OptionalAuthGuard} from "./guards/optional-auth.guard";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {OptionalJwtStrategy} from "./strategies/optional-jwt.strategy";

@Module({
    providers: [HasRoleGuard, OptionalAuthGuard, JwtStrategy, OptionalJwtStrategy],
    imports: [PassportModule]
})
export class AuthModule {}
