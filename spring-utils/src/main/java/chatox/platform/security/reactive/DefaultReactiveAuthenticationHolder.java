package chatox.platform.security.reactive;

import chatox.platform.security.jwt.JwtPayload;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import java.util.function.Function;

@RequiredArgsConstructor
public class DefaultReactiveAuthenticationHolder<UserClass> extends AbstractReactiveAuthenticationHolder<UserClass> {
    private final Function<JwtPayload, Mono<UserClass>> userProvider;

    @Override
    public Mono<UserClass> getCurrentUser() {
        return getCurrentUserDetails().flatMap(userProvider);
    }
}
