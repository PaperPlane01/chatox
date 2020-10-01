import {Module} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {EurekaRegistrationHandler} from "./EurekaRegistrationHandler";
import {config} from "../env-config";

@Module({
    providers: [
        {
            provide: Eureka,
            useValue: new Eureka({
                instance: {
                    app: config.EVENTS_SERVICE_EUREKA_APP_NAME,
                    instanceId: `${config.EVENTS_SERVICE_EUREKA_APP_NAME}-${config.EVENTS_SERVICE_PORT}`,
                    ipAddr: "127.0.0.1",
                    hostName: config.EUREKA_HOST,
                    dataCenterInfo: {
                        "@class": "com.netflix.appinfo.MyDataCenterInfo",
                        name: "MyOwn"
                    },
                    vipAddress: config.EVENTS_SERVICE_EUREKA_APP_NAME,
                    port: {
                        $: config.EVENTS_SERVICE_PORT,
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
