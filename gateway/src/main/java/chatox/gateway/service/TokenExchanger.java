package chatox.gateway.service;

import chatox.gateway.exception.AccessTokenExpiredException;
import chatox.gateway.exception.InternalServerErrorException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenExchanger {
    private final LoadBalancerClient loadBalancerClient;

    private static final String OAUTH2_SERVICE_ID = "oauth2-service";
    private static final String EXCHANGE_TOKEN = "oauth/exchangeToken";

    public Mono<String> exchangeAccessTokenToJwtToken(String accessToken) {
        var oauth2ServiceInstance = loadBalancerClient.choose(OAUTH2_SERVICE_ID);
        var url = oauth2ServiceInstance.getUri().toString();
        var exchangeTokenRequest = new ExchangeTokenRequest(accessToken);

        var webClient = WebClient.create(url + "/" + EXCHANGE_TOKEN);

        return webClient
                .post()
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(exchangeTokenRequest), ExchangeTokenRequest.class)
                .exchange()
                .doOnNext(clientResponse -> {
                    if (clientResponse.statusCode().isError()) {
                        if (clientResponse.statusCode().equals(HttpStatus.UNAUTHORIZED)) {
                            throw new AccessTokenExpiredException("Access token is either expired or invalid");
                        }

                        log.error(String.format(
                                "Unexpected error occurred when tried to exchange access token: OAuth2 service responded with status %d",
                                clientResponse.statusCode().value()
                        ));

                        throw new InternalServerErrorException();
                    }
                })
                .flatMap(clientResponse -> clientResponse.bodyToMono(ExchangeTokenResponse.class))
                .map(ExchangeTokenResponse::getJwt);

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
