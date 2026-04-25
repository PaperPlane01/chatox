import {Injectable, ServiceUnavailableException} from "@nestjs/common";
import {Eureka, EurekaClient} from "eureka-js-client";
import EurekaInstanceConfig = EurekaClient.EurekaInstanceConfig;
import PortWrapper = EurekaClient.PortWrapper;
import LegacyPortWrapper = EurekaClient.LegacyPortWrapper;

@Injectable()
export class EurekaService {
	constructor(private readonly eureka: Eureka) {
	}

	public getUrlForService(serviceName: string): string {
		const serviceInstances = this.eureka.getInstancesByAppId(serviceName);

		if (serviceInstances.length === 0) {
			throw new ServiceUnavailableException();
		}

		const serviceInstance = serviceInstances[0];
		const host = serviceInstance.hostName;
		const port = this.getEurekaInstancePort(serviceInstance);

		return `http://${host}:${port}`;
	}

	private getEurekaInstancePort(eurekaInstance: EurekaInstanceConfig): number {
		if (typeof eurekaInstance.port === "object") {
			if ((eurekaInstance.port as PortWrapper).port) {
				return ((eurekaInstance.port) as PortWrapper).port;
			} else if ((eurekaInstance.port as LegacyPortWrapper).$) {
				return (eurekaInstance.port as LegacyPortWrapper).$;
			} else {
				throw new ServiceUnavailableException();
			}
		} else {
			return eurekaInstance.port;
		}
	}
}
