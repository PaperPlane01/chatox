package chatox.platform.security.web;

import chatox.platform.security.jwt.JwtPayload;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import java.util.function.Function;

@RequiredArgsConstructor
public class DefaultAuthenticationHolder<U> extends AbstractAuthenticationHolder<U> {
    private final Function<JwtPayload, Optional<U>> userProvider;

    @Override
    public Optional<U> getCurrentUser() {
        return getCurrentUserDetails().flatMap(userProvider);
    }
}