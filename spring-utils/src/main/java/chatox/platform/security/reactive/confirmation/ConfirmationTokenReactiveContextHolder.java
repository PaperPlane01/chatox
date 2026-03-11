package chatox.platform.security.reactive.confirmation;

import chatox.platform.security.confirmation.ConfirmationTokenContext;
import chatox.platform.security.confirmation.ConfirmationTokenPayload;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ConfirmationTokenReactiveContextHolder {
    private static final Class<?> CONFIRMATION_TOKEN_CONTEXT_KEY = ConfirmationTokenContext.class;

    public static Mono<ConfirmationTokenContext> getConfirmationTokenContext() {
        return Mono.deferContextual(Mono::just)
                .cast(Context.class)
                .filter(ConfirmationTokenReactiveContextHolder::hasConfirmationTokenContext)
                .flatMap(ConfirmationTokenReactiveContextHolder::getConfirmationTokenContext);
    }

    private static boolean hasConfirmationTokenContext(Context context) {
        return context.hasKey(CONFIRMATION_TOKEN_CONTEXT_KEY);
    }

    private static Mono<ConfirmationTokenContext> getConfirmationTokenContext(Context context) {
        return context.<Mono<ConfirmationTokenContext>>get(CONFIRMATION_TOKEN_CONTEXT_KEY);
    }

    public static Context withConfirmationToken(ConfirmationTokenPayload payload) {
        return Context.of(CONFIRMATION_TOKEN_CONTEXT_KEY, Mono.just(new ConfirmationTokenContext(payload)));
    }
}
