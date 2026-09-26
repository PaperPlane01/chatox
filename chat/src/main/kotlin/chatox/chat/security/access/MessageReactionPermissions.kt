package chatox.chat.security.access

import chatox.chat.model.User
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatRoleService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class MessageReactionPermissions(
    private val chatRoleService: ChatRoleService,
    private val chatBlockingService: ChatBlockingService,
    private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canCreateMessageReaction(chatId: String, emojiId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()

            if (currentUser.isBannedGlobally) {
                return@mono false
            }

            val role = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                ?: return@mono false

            return@mono role.features.addReactions.enabled
                    && (
                    role.features.addReactions.additional.allowedEmojis.isEmpty()
                            || role.features.addReactions.additional.allowedEmojis.any { it.id == emojiId }
                            )
                    && !chatBlockingService.isUserBlockedInChat(chatId = chatId, userId = currentUser.id).awaitFirst()
        }
    }
}
