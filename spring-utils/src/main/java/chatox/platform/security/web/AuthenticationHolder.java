package chatox.platform.security.web;

import chatox.platform.security.jwt.JwtAuthentication;
import chatox.platform.security.jwt.JwtPayload;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Optional;

public interface AuthenticationHolder<U> {
    Optional<JwtAuthentication> getCurrentAuthentication();

    default JwtAuthentication requireCurrentAuthentication() {
        return getCurrentAuthentication().orElseThrow(() -> new BadCredentialsException("Bad credentials"));
    }

    default Optional<JwtPayload> getCurrentUserDetails() {
        return getCurrentAuthentication().map(JwtAuthentication::getJwtPayload);
    }

    default JwtPayload requireCurrentUserDetails() {
        return getCurrentUserDetails().orElseThrow(() -> new BadCredentialsException("Bad credentials"));
    }

    Optional<U> getCurrentUser();

    default U requireCurrentUser() {
        return getCurrentUser().orElseThrow(() -> new BadCredentialsException("Bad credentials"));
    }
}
