import {Module} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {EurekaRegistrationHandler} from "./eureka-registration.handler";
import {EurekaService} from "./eureka.service";
import {config} from "../config/env.config";

@Module({
    providers: [
        {
            provide: Eureka,
            useValue: new Eureka({
                instance: {
                    app: config.REPORTS_SERVICE_EUREKA_APP_NAME,
                    instanceId: `${config.REPORTS_SERVICE_EUREKA_APP_NAME}-${config.REPORTS_SERVICE_PORT}`,
                    ipAddr: "127.0.0.1",
                    hostName: config.EUREKA_HOST,
                    dataCenterInfo: {
                        "@class": "com.netflix.appinfo.MyDataCenterInfo",
                        name: "MyOwn"
                    },
                    vipAddress: config.REPORTS_SERVICE_EUREKA_APP_NAME,
                    port: {
                        $: config.REPORTS_SERVICE_PORT,
                        "@enabled": true
                    }
                },
                eureka: {
                    preferIpAddress: true,
                    fetchRegistry: true,
                    host: config.EUREKA_HOST,
                    port: config.EUREKA_PORT,
                    servicePath: "/eureka/apps",
                }
            })
        },
        EurekaRegistrationHandler,
        EurekaService
    ],
    exports: [Eureka, EurekaService]
})
export class EurekaModule {}
