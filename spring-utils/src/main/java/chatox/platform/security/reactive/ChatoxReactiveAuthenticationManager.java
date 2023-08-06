package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtAuthentication;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class ChatoxReactiveAuthenticationManager implements ReactiveAuthenticationManager {
    private final ReactiveJwtDecoder reactiveJwtDecoder;

    @Override
    public Mono<Authentication> authenticate(Authentication candidate) {
        return Mono.justOrEmpty(candidate)
                .filter(authentication -> authentication instanceof BearerTokenAuthenticationToken)
                .cast(BearerTokenAuthenticationToken.class)
                .flatMap(authentication -> reactiveJwtDecoder.decode(authentication.getToken()))
                .map(JwtAuthenticationToken::new)
                .map(JwtAuthentication::new)
                .cast(Authentication.class)
                .onErrorMap(error -> {
                    if (error instanceof JwtValidationException) {
                        return new BadCredentialsException("JWT is invalid");
                    }

                    return error;
                });
    }
}
