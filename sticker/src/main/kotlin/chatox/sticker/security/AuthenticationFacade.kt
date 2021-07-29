package chatox.sticker.security

import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class AuthenticationFacade {
    fun getCurrentAuthentication() = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .filter { it.javaClass == CustomAuthentication::class.java }
            .map { it }
            .cast(CustomAuthentication::class.java)

    fun getCurrentUserDetails(): Mono<CustomUserDetails> {
        return getCurrentAuthentication()
                .map { it.customUserDetails }
    }
}
