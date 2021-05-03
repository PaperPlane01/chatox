import {Eureka, EurekaClient} from "eureka-js-client";
import {Injectable} from "@nestjs/common";
import {ServiceNotAvailableException} from "./exceptions/service-not-available.exception";
import EurekaInstanceConfig = EurekaClient.EurekaInstanceConfig;
import {NoPortPresentException} from "./exceptions/no-port-present.exception";
import PortWrapper = EurekaClient.PortWrapper;
import LegacyPortWrapper = EurekaClient.LegacyPortWrapper;

@Injectable()
export class EurekaService {
    constructor(private readonly eureka: Eureka) {
    }

    public getUrlForService(appId: string): string {
        const appInstances = this.eureka.getInstancesByAppId(appId);

        if (appInstances.length === 0) {
            throw new ServiceNotAvailableException(`Could not find instances of service ${appId}`);
        }

        const appInstance = appInstances[0];
        const ipAddress = appInstance.ipAddr;
        const port = this.getEurekaInstancePort(appInstance);

        return `http://${ipAddress}:${port}`;
    }

    public getEurekaInstancePort(eurekaInstance: EurekaInstanceConfig): number {
        if (typeof eurekaInstance.port === "object") {
            if ((eurekaInstance.port as PortWrapper).port) {
                return ((eurekaInstance.port) as PortWrapper).port;
            } else if ((eurekaInstance.port as LegacyPortWrapper).$) {
                return (eurekaInstance.port as LegacyPortWrapper).$;
            } else {
                throw new NoPortPresentException();
            }
        } else {
            return eurekaInstance.port;
        }
    };
}
