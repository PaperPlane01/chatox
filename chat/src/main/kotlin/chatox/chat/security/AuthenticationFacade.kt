package chatox.chat.security

import chatox.chat.model.User
import chatox.chat.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
@Transactional
class AuthenticationFacade {
    @Lazy
    @Autowired
    private lateinit var userRepository: UserRepository

    val EMPTY_USER = User(
            id = "EMPTY_ID",
            firstName = "anon",
            lastName = null,
            slug = null,
            avatarUri = null,
            accountId = "",
            deleted = true,
            lastSeen = null,
            bio = null,
            createdAt = ZonedDateTime.now(),
            dateOfBirth = null,
            online = false,
            email = null
    )

    fun getCurrentAuthentication() = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .filter { it.javaClass == CustomAuthentication::class.java }
            .map { it }
            .cast(CustomAuthentication::class.java)

    fun getCurrentUserDetails(): Mono<CustomUserDetails> {
        return getCurrentAuthentication()
                .map { it.customUserDetails }
    }

    fun getCurrentUser() = getCurrentUserDetails()
            .map { userRepository.findById(it.id) }
            .flatMap { it }
            .switchIfEmpty(Mono.just(EMPTY_USER))
}
