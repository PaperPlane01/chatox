package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtAuthentication;
import chatox.platform.security.jwt.JwtPayload;
import reactor.core.publisher.Mono;

public interface ReactiveAuthenticationHolder<U> {
    /**
     * Returns current authentication, or empty <code>Mono</code> if absent. <br/>
     * @return <code>Mono</code> with {@link JwtAuthentication} instance if present
     */
    Mono<JwtAuthentication> getCurrentAuthentication();

    /**
     * Returns current authentication
     * @return <code>Mono</code> with {@link JwtAuthentication} instance
     * @throws org.springframework.security.authentication.BadCredentialsException if no authentication is present
     */
    Mono<JwtAuthentication> requireCurrentAuthentication();

    /**
     * Returns current JWT payload, or empty <code>Mono</code> if absent. <br/>
     * It is implied that <strong>no database calls are being made</strong>
     * in this method.
     * @return <code>Mono</code> with {@link JwtPayload} instance if present
     */
    Mono<JwtPayload> getCurrentUserDetails();

    /**
     * Returns current JWT payload. <br/>
     * It is implied that <b>no database calls are being made</b>
     * in this method.
     * @return <code>Mono</code> with {@link JwtPayload} instance
     * @throws org.springframework.security.authentication.BadCredentialsException if no authentication is present
     */
    Mono<JwtPayload> requireCurrentUserDetails();

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
    Mono<U> requireCurrentUser();
}
