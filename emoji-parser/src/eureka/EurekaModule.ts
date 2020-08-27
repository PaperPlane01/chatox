import {Module} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {EurekaRegistrationHandler} from "./EurekaRegistrationHandler";
import {config} from "../config";

@Module({
    providers: [
        {
            provide: Eureka,
            useValue: new Eureka({
                instance: {
                    app: config.EUREKA_APP_NAME,
                    instanceId: `${config.EUREKA_APP_NAME}-${config.EMOJI_PARSER_PORT}`,
                    ipAddr: config.EUREKA_APP_INSTANCE_IP_ADDRESS,
                    hostName: config.EUREKA_APP_INSTANCE_HOST,
                    dataCenterInfo: {
                        "@class": "com.netflix.appinfo.MyDataCenterInfo",
                        name: "MyOwn"
                    },
                    vipAddress: config.EUREKA_APP_NAME,
                    port: {
                        $: config.EMOJI_PARSER_PORT,
                        "@enabled": true
                    }
                },
                eureka: {
                    preferIpAddress: true,
                    fetchRegistry: false,
                    host: config.EUREKA_HOST,
                    port: config.EUREKA_PORT,
                    servicePath: "/eureka/apps"
                }
            })
        },
        EurekaRegistrationHandler
    ]
})
export class EurekaModule {}
