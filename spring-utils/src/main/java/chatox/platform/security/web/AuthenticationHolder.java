package chatox.platform.security.web;

import chatox.platform.security.jwt.JwtAuthentication;
import chatox.platform.security.jwt.JwtPayload;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public interface AuthenticationHolder<U> {
    default Optional<JwtAuthentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(JwtAuthentication.class::isInstance)
                .map(JwtAuthentication.class::cast);
    }

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
