package chatox.chat.security

import chatox.chat.model.User
import chatox.chat.repository.UserRepository
import org.springframework.context.annotation.Lazy
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class AuthenticationFacade {
    @Lazy
    private lateinit var userRepository: UserRepository

    fun getCurrentUser(): Mono<User> {
        return ReactiveSecurityContextHolder.getContext()
                .map { it.authentication }
                .filter { it is CustomAuthentication }
                .cast(CustomAuthentication::class.java)
                .map { it.customUserDetails }
                .map { userRepository.findById(it.id) }
                .flatMap { it }
    }
}
