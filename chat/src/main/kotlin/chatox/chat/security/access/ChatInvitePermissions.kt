package chatox.chat.security.access

import chatox.chat.model.User
import chatox.chat.service.ChatRoleService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatInvitePermissions(private val chatRoleService: ChatRoleService,
                            private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canManageChatInvites(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val currentUserRole = chatRoleService.getRoleOfUserInChat(
                    userId = currentUser.id,
                    chatId = chatId
            )
                    .awaitFirstOrNull() ?: return@mono false

            return@mono currentUserRole.features.manageInvites.enabled
        }
    }
}