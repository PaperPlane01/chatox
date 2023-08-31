package chatox.user.security.access

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.domain.User
import chatox.user.service.UserBlacklistService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserInteractionPermissions(
        private val userBlacklistService: UserBlacklistService,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canCreateInteraction(userId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (currentUser.id == userId) {
                return@mono false
            }

            return@mono !userBlacklistService.isUserBlacklisted(currentUser.id, userId).awaitFirst()
        }
    }
}