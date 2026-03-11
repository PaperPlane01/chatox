package chatox.platform.security.reactive.confirmation.filter;

import chatox.platform.security.reactive.confirmation.ConfirmationTokenReactiveContextHolder;
import chatox.platform.security.confirmation.ConfirmationTokenPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class ConfirmationTokenWebFilter implements WebFilter {
    private final ReactiveJwtDecoder jwtDecoder;

    private static final String CONFIRMATION_TOKEN_HEADER = "X-Confirmation-Token";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        var confirmationToken = exchange.getRequest().getHeaders().getFirst(CONFIRMATION_TOKEN_HEADER);

        if (StringUtils.hasText(confirmationToken)) {
            return jwtDecoder.decode(confirmationToken)
                    .map(ConfirmationTokenPayload::from)
                    .map(ConfirmationTokenReactiveContextHolder::withConfirmationToken)
                    .flatMap(context -> chain.filter(exchange).contextWrite(context));
        }

        return chain.filter(exchange);
    }
}
