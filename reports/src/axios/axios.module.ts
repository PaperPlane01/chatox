import {Module} from "@nestjs/common";
import axios from "axios";
import {AXIOS_INSTANCE} from "./constants";
import {OauthClient} from "../oauth/oauth.client";
import {OauthModule} from "../oauth/oauth.module";

@Module({
    providers: [
        {
            provide: AXIOS_INSTANCE,
            inject: [OauthClient],
            useFactory: (oauthClient: OauthClient) => {
                let accessToken: string | undefined = undefined;
                const axiosInstance = axios.create();

                axiosInstance.interceptors.request.use(async requestConfig => {
                    if (!accessToken) {
                        accessToken = await oauthClient.getAccessToken();
                    }

                    requestConfig.headers.Authorization = `Bearer ${accessToken}`;

                    return requestConfig;
                });

                axiosInstance.interceptors.response.use(undefined, async error => {
                    if (error.response && error.response.status === 401) {
                        const originalRequest = error.response.config;
                        accessToken = await oauthClient.getAccessToken();
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                        return axiosInstance(originalRequest);
                    } else {
                        throw error;
                    }
                });

                return axiosInstance;
            },
        }
    ],
    exports: [AXIOS_INSTANCE],
    imports: [OauthModule]
})
export class AxiosModule {}
