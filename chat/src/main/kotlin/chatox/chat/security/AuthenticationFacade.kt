package chatox.chat.security

import chatox.chat.model.User
import chatox.chat.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.Date

@Component
class AuthenticationFacade {
    @Lazy
    @Autowired
    private lateinit var userRepository: UserRepository

    val EMPTY_USER = User(
            id = "",
            firstName = "anon",
            lastName = null,
            slug = null,
            avatarUri = null,
            accountId = "",
            deleted = true,
            lastSeen = null,
            bio = null,
            createdAt = Date.from(Instant.now()),
            dateOfBirth = null
    )

    fun getCurrentAuthentication() = ReactiveSecurityContextHolder.getContext()
            .map { it.authentication }
            .filter { it is CustomAuthentication }
            .cast(CustomAuthentication::class.java)

    fun getCurrentUserDetails() = getCurrentAuthentication()
            .map { it.customUserDetails }

    fun getCurrentUser() = getCurrentUserDetails()
            .map { userRepository.findById(it.id) }
            .flatMap { it }
            .switchIfEmpty(Mono.just(EMPTY_USER))
}
