import {Module} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {EurekaRegistrationHandler} from "./EurekaRegistrationHandler";

@Module({
    providers: [
        {
            provide: Eureka,
            useValue: new Eureka({
                instance: {
                    app: process.env.EUREKA_APP_NAME,
                    instanceId: `${process.env.EUREKA_APP_NAME}-${process.env.SERVER_PORT}`,
                    ipAddr: "127.0.0.1",
                    hostName: "localhost",
                    dataCenterInfo: {
                        "@class": "com.netflix.appinfo.MyDataCenterInfo",
                        name: "MyOwn"
                    },
                    vipAddress: process.env.EUREKA_APP_NAME,
                    port: {
                        $: Number(process.env.SERVER_PORT),
                        "@enabled": true
                    }
                },
                eureka: {
                    preferIpAddress: true,
                    fetchRegistry: false,
                    host: process.env.EUREKA_HOST,
                    port: Number(process.env.EUREKA_PORT),
                    servicePath: "/eureka/apps"
                }
            })
        },
        EurekaRegistrationHandler
    ]
})
export class EurekaModule {}
