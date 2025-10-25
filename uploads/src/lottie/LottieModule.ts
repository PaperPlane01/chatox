import {Module} from "@nestjs/common";
import axios, {AxiosInstance} from "axios";
import {LOTTIE_SERVICE_AXIOS_INSTANCE} from "./constants";
import {EurekaModule, EurekaService} from "../eureka";
import {LottieService} from "./LottieService";

@Module({
	providers: [
		{
			provide: LOTTIE_SERVICE_AXIOS_INSTANCE,
			inject: [EurekaService],
			useFactory: (eurekaService: EurekaService): AxiosInstance => {
				const axiosInstance = axios.create();

				axiosInstance.interceptors.request.use(requestConfig => {
					const url = requestConfig.url;
					let serviceName = url.replace("http://", "");

					if (serviceName.includes("/")) {
						serviceName = serviceName.substring(0, serviceName.indexOf("/"));
					}

					const serviceUrl = eurekaService.getUrlForService(serviceName);

					requestConfig.url = requestConfig.url.replace(`http://${serviceName}`, serviceUrl);

					return requestConfig;
				});

				return axiosInstance;
			}
		},
		LottieService
	],
	imports: [EurekaModule],
	exports: [LottieService]
})
export class LottieModule {

}
