package chatox.gateway.filter;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Collections;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class FixMissingCorsHeadersFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        var responseHeaders = exchange.getResponse().getHeaders();

        if (StringUtils.isEmpty(responseHeaders.getAccessControlAllowOrigin())) {
            exchange.getResponse().getHeaders().setAccessControlAllowOrigin("*");
            exchange.getResponse().getHeaders().setAccessControlAllowMethods(Arrays.asList(
                    HttpMethod.GET,
                    HttpMethod.POST,
                    HttpMethod.OPTIONS,
                    HttpMethod.PUT,
                    HttpMethod.DELETE,
                    HttpMethod.TRACE,
                    HttpMethod.PATCH
            ));
            exchange.getResponse().getHeaders().setAccessControlAllowHeaders(Collections.singletonList("*"));
            exchange.getResponse().getHeaders().setAccessControlAllowCredentials(true);
        }

        return chain.filter(exchange);
    }
}
