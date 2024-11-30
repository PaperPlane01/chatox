package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtAuthentication;
import chatox.platform.security.jwt.JwtPayload;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import reactor.core.publisher.Mono;

public interface ReactiveAuthenticationHolder<U> {
    /**
     * Returns current authentication, or empty <code>Mono</code> if absent. <br/>
     * @return <code>Mono</code> with {@link JwtAuthentication} instance if present
     */
    default Mono<JwtAuthentication> getCurrentAuthentication() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthentication.class::isInstance)
                .cast(JwtAuthentication.class);
    }

    /**
     * Returns current authentication
     * @return <code>Mono</code> with {@link JwtAuthentication} instance
     * @throws org.springframework.security.authentication.BadCredentialsException if no authentication is present
     */
    default Mono<JwtAuthentication> requireCurrentAuthentication() {
        return getCurrentAuthentication()
                .switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }

    /**
     * Returns current JWT payload, or empty <code>Mono</code> if absent. <br/>
     * It is implied that <strong>no database calls are being made</strong>
     * in this method.
     * @return <code>Mono</code> with {@link JwtPayload} instance if present
     */
    default Mono<JwtPayload> getCurrentUserDetails() {
        return getCurrentAuthentication()
                .map(JwtAuthentication::getJwtPayload);
    }

    /**
     * Returns current JWT payload. <br/>
     * It is implied that <b>no database calls are being made</b>
     * in this method.
     * @return <code>Mono</code> with {@link JwtPayload} instance
     * @throws org.springframework.security.authentication.BadCredentialsException if no authentication is present
     */
    default Mono<JwtPayload> requireCurrentUserDetails() {
        return getCurrentUserDetails()
                .switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }

    /**
     * Returns current user, or empty <code>Mono</code> if absent. <br/>
     * It is implied that <strong>database calls might be made</strong> in this method.
     * @return <code>Mono</code> with current user
     */
    Mono<U> getCurrentUser();

    /**
     * Returns current user. <br/>
     * It is implied that <strong>database calls might be made</strong> in this method.
     * @return <code>Mono</code> with current user
     * @throws org.springframework.security.authentication.BadCredentialsException if no authentication is present
     */
    default Mono<U> requireCurrentUser() {
        return getCurrentUser()
                .switchIfEmpty(Mono.error(new BadCredentialsException("Bad credentials")));
    }
}
