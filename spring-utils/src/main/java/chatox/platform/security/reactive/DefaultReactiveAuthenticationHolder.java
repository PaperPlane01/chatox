package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtPayload;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.util.function.Function;

@RequiredArgsConstructor
public class DefaultReactiveAuthenticationHolder<U> extends AbstractReactiveAuthenticationHolder<U> {
    private final Function<JwtPayload, Mono<U>> userProvider;

    @Override
    public Mono<U> getCurrentUser() {
        return getCurrentUserDetails().flatMap(userProvider);
    }
}
