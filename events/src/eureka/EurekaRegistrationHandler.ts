import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from "@nestjs/common";
import {Eureka} from "eureka-js-client";
import {LoggerFactory} from "../logging";

@Injectable()
export class EurekaRegistrationHandler implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly log = LoggerFactory.getLogger(EurekaRegistrationHandler);

    constructor(private readonly eurekaClient: Eureka) {}

    public onApplicationBootstrap(): void {
        this.log.log("Initializing eureka client");
        this.eurekaClient.start();
    }

    public onApplicationShutdown(signal?: string): void {
        this.log.log("Shutting down eureka client");
        this.eurekaClient.stop();
    }
}
