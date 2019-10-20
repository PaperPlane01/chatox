package chatox.gateway.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class TokenExchanger {
    private final LoadBalancerClient loadBalancerClient;

    private static final String OAUTH2_SERVICE_ID = "oauth2-service";
    private static final String EXCHANGE_TOKEN = "oauth/exchangeToken";

    public String exchangeAccessTokenToJwtToken(String accessToken) {
        var oauth2ServiceInstance = loadBalancerClient.choose(OAUTH2_SERVICE_ID);
        var url = oauth2ServiceInstance.getUri().toString();
        var exchangeTokenRequest = new ExchangeTokenRequest(accessToken);

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<ExchangeTokenResponse> response = restTemplate.postForEntity(
                url + "/" + EXCHANGE_TOKEN,
                exchangeTokenRequest,
                ExchangeTokenResponse.class
        );

        return response.getBody().getJwt();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    private static class ExchangeTokenRequest {
        private String accessToken;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    private static class ExchangeTokenResponse {
        private String jwt;
    }
}
