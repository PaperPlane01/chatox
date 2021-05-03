import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from "@nestjs/common";
import {Eureka} from "eureka-js-client";

@Injectable()
export class EurekaRegistrationHandler implements OnApplicationBootstrap, OnApplicationShutdown {
    constructor(private readonly eureka: Eureka) {
    }

    public onApplicationBootstrap(): void {
        this.eureka.start();
    }

    public onApplicationShutdown(signal?: string): void {
        this.eureka.stop();
    }

}
