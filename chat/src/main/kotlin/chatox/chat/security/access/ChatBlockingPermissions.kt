package chatox.chat.security.access

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.exception.ChatParticipationNotFoundException
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatRoleService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatBlockingPermissions(private val chatRoleService: ChatRoleService,
                              private val authenticationFacade: AuthenticationFacade) {

    fun canBlockUser(chatId: String, createChatBlockingRequest: CreateChatBlockingRequest): Mono<Boolean> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
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

            if (otherUserBlockingImmunity.additional == null) {
                return@mono false
            }

            if (otherUserBlockingImmunity.additional.upToLevel == null) {
                return@mono false
            }

            return@mono currentUserRole.level > otherUserBlockingImmunity.additional.upToLevel
        }
    }

    fun canUnblockUser(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .flatMap { chatRoleService.getRoleOfUserInChat(chatId, it.id) }
                .map { it.features.blockUsers.enabled }
                .switchIfEmpty(Mono.just(false))
    }

    fun canSeeChatBlockings(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .filter { it.authorities.map { authority -> authority.authority }.contains("ROLE_USER") }
                .flatMap { chatRoleService.getRoleOfUserInChat(chatId, it.id) }
                .map { it.features.blockUsers.enabled }
                .switchIfEmpty(Mono.just(false))

    }

    fun canUpdateBlocking(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .flatMap { chatRoleService.getRoleOfUserInChat(chatId, it.id) }
                .map { it.features.blockUsers.enabled }
    }
}
