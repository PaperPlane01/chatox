import { Module } from "@nestjs/common";
import axios from "axios";
import {OAUTH_CLIENT_AXIOS_INSTANCE} from "./constants";
import {OauthClient} from "./oauth.client";
import {EurekaModule} from "../eureka/eureka.module";

@Module({
    providers: [
        {
            provide: OAUTH_CLIENT_AXIOS_INSTANCE,
            useValue: axios.create()
        },
        OauthClient
    ],
    imports: [EurekaModule],
    exports: [OauthClient]
})
export class OauthModule {}
