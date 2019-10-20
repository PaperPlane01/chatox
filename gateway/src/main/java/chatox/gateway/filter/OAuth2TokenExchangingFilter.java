package chatox.gateway.filter;

import chatox.gateway.service.TokenExchanger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class OAuth2TokenExchangingFilter implements WebFilter {
    @Autowired
    private TokenExchanger tokenExchanger;

    private static final String OAUTH2_SERVICE_URL = "/oauth";

    @Override
    public Mono<Void> filter(ServerWebExchange serverWebExchange, WebFilterChain webFilterChain) {
        var path = serverWebExchange.getRequest().getPath().toString();

        if (!path.startsWith(OAUTH2_SERVICE_URL)) {
            if (serverWebExchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                var accessToken = serverWebExchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                var jwt = tokenExchanger.exchangeAccessTokenToJwtToken(accessToken.replace("Bearer ", ""));
                var request = serverWebExchange.getRequest()
                        .mutate()
                        .headers(httpHeaders -> httpHeaders.set(HttpHeaders.AUTHORIZATION, "Bearer " + jwt))
                        .build();
                var exchange = serverWebExchange.mutate()
                        .request(request)
                        .build();
                return webFilterChain.filter(exchange);
            }
        }

        return webFilterChain.filter(serverWebExchange);
    }
}
