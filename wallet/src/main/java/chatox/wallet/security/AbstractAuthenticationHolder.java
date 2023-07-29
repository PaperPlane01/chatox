package chatox.wallet.security;

import chatox.wallet.security.jwt.JwtAuthentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public abstract class AbstractAuthenticationHolder<U> implements AuthenticationHolder<U> {

    @Override
    public Optional<JwtAuthentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(authentication -> authentication instanceof JwtAuthentication)
                .map(authentication -> (JwtAuthentication) authentication);
    }
}
