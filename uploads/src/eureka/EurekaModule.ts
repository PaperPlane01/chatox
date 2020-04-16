import {Module} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {config} from "../config";
import {EurekaRegistrationHandler} from "./EurekaRegistrationHandler";

@Module({
    providers: [
        {
            provide: Eureka,
            useValue: new Eureka({
                instance: {
                    app: config.EUREKA_APP_NAME,
                    instanceId: `${config.EUREKA_APP_NAME}-${config.PORT}`,
                    ipAddr: config.EUREKA_APP_INSTANCE_IP_ADDRESS,
                    hostName: config.EUREKA_APP_INSTANCE_HOST,
                    dataCenterInfo: {
                        "@class": "com.netflix.appinfo.MyDataCenterInfo",
                        name: "MyOwn"
                    },
                    vipAddress: config.EUREKA_APP_NAME,
                    port: {
                        $: config.PORT,
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
