package chatox.chat.security.access

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.model.User
import chatox.chat.service.ChatRoleService
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatBlockingPermissions(private val chatRoleService: ChatRoleService,
                              private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canBlockUser(chatId: String, createChatBlockingRequest: CreateChatBlockingRequest): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val currentUserRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false
            val otherUserRole = chatRoleService.getRoleOfUserInChat(userId = createChatBlockingRequest.userId, chatId = chatId).awaitFirstOrNull()
                    ?: throw ChatParticipationNotFoundException("User $${createChatBlockingRequest.userId} is not a participant of chat $chatId")

            if (!currentUserRole.features.blockUsers.enabled) {
                return@mono false
            }

            if (!otherUserRole.features.blockingImmunity.enabled) {
                return@mono true
            }

            val otherUserBlockingImmunity = otherUserRole.features.blockingImmunity

            if (otherUserBlockingImmunity.additional.upToLevel == null) {
                return@mono false
            }

            return@mono currentUserRole.level > otherUserBlockingImmunity.additional.upToLevel
        }
    }

    fun canUnblockUser(chatId: String): Mono<Boolean> {
        return authenticationHolder.currentUserDetails
                .flatMap { chatRoleService.getRoleOfUserInChat(chatId, it.id) }
                .map { it.features.blockUsers.enabled }
                .switchIfEmpty(Mono.just(false))
    }

    fun canSeeChatBlockings(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            return@mono chatRole.features.blockUsers.enabled
        }
    }

    fun canUpdateBlocking(chatId: String): Mono<Boolean> {
        return authenticationHolder.requireCurrentUserDetails()
                .flatMap { chatRoleService.getRoleOfUserInChat(userId = it.id, chatId = chatId) }
                .map { it.features.blockUsers.enabled }
    }
}
