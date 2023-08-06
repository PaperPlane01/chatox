package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtAuthentication;
import chatox.platform.security.jwt.JwtPayload;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import reactor.core.publisher.Mono;

public abstract class AbstractReactiveAuthenticationHolder<U> implements ReactiveAuthenticationHolder<U> {

    @Override
    public Mono<JwtAuthentication> getCurrentAuthentication() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(authentication -> authentication instanceof JwtAuthentication)
                .cast(JwtAuthentication.class);
    }

    @Override
    public Mono<JwtAuthentication> requireCurrentAuthentication() {
        return getCurrentAuthentication().switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }

    @Override
    public Mono<JwtPayload> getCurrentUserDetails() {
        return getCurrentAuthentication().map(JwtAuthentication::getJwtPayload);
    }

    @Override
    public Mono<JwtPayload> requireCurrentUserDetails() {
        return getCurrentUserDetails().switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }

    @Override
    public abstract Mono<U> getCurrentUser();

    @Override
    public Mono<U> requireCurrentUser() {
        return getCurrentUser().switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }
}
