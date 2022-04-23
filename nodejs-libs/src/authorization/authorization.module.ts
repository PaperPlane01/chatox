import {DynamicModule, Module} from "@nestjs/common";
import {JWT_PUBLIC_KEY, JWT_STRATEGY} from "./constants";
import {JwtStrategy, OptionalJwtStrategy} from "./strategies";

@Module({})
export class AuthorizationModule {
    public static register(jwtPublicKey: string): DynamicModule {
        return {
            module: AuthorizationModule,
            providers: [
                {
                    provide: JWT_PUBLIC_KEY,
                    useValue: jwtPublicKey
                },
                JwtStrategy,
                OptionalJwtStrategy,
                
            ]
        }
    }
}