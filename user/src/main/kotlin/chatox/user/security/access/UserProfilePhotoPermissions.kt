package chatox.user.security.access

import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.domain.User
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserProfilePhotoPermissions(private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canCreateUserProfilePhoto(userId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            return@mono currentUser.id == userId && !currentUser.isBannedGlobally
        }
    }

    fun canDeleteUserProfilePhoto(userId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            return@mono currentUser.id == userId || currentUser.isAdmin
        }
    }
}