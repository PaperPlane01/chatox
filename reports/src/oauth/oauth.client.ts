import {Inject, Injectable, Logger} from "@nestjs/common";
import {AxiosInstance} from "axios";
import {stringify} from "querystring";
import {OAUTH_CLIENT_AXIOS_INSTANCE} from "./constants";
import {AccessTokenResponse} from "./types/responses/access-token.response";
import {ExchangeTokenResponse} from "./types/responses/exchange-token.response";
import {ExchangeTokenRequest} from "./types/requests/exchange-token.request";
import {AccessTokenRetrievalException} from "./exceptions/access-token-retrieval.exception";
import {config} from "../config/env.config";
import {EurekaService} from "../eureka/eureka.service";

@Injectable()
export class OauthClient {
    private readonly log = new Logger(OauthClient.name);
    
    constructor(private readonly eurekaService: EurekaService,
                @Inject(OAUTH_CLIENT_AXIOS_INSTANCE) private readonly axios: AxiosInstance) {
    }

    public async getAccessToken(tokenType: "plain" | "jwt" = "jwt"): Promise<string> {
        const url = this.eurekaService.getUrlForService("oauth2-service")

        try {
            this.log.verbose("Retrieving access token");
            const accessTokenResponse = await this.axios.post<AccessTokenResponse>(
                `${url}/oauth/token`,
                stringify({
                    client_id: config.REPORTS_SERVICE_CLIENT_ID,
                    client_secret: config.REPORTS_SERVICE_CLIENT_SECRET,
                    grant_type: "client_credentials"
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/json"
                    }
                }
            );
            
            const accessToken = accessTokenResponse.data.access_token;
            
            if (tokenType === "jwt") {
                this.log.verbose("Exchanging access token to JWT");
                const exchangeTokenRequest: ExchangeTokenRequest = {accessToken};
                const exchangeTokenResponse = await this.axios.post<ExchangeTokenResponse>(
                    `${url}/oauth/exchangeToken`,
                    exchangeTokenRequest,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json"
                        }
                    }
                );
                return exchangeTokenResponse.data.jwt;
            } else {
                return accessToken;
            }
        } catch (error) {
            this.log.error("Error occurred when tried to retrieve access token");
            this.log.error(error.trace ? error.trace : error);
            
            throw new AccessTokenRetrievalException();
        }
    }
}
