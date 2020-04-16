import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from "@nestjs/common";
import {Eureka} from "eureka-js-client";

@Injectable()
export class EurekaRegistrationHandler implements OnApplicationBootstrap, OnApplicationShutdown {
    constructor(private readonly eurekaClient: Eureka) {};

    public onApplicationBootstrap(): void {
        this.eurekaClient.start();
    }

    public onApplicationShutdown(signal?: string): void {
        this.eurekaClient.stop();
    }
}
