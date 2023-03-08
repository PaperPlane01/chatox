package chatox.chat.security.access

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.config.CacheWrappersConfig
import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.model.Chat
import chatox.chat.model.User
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.ChatRoleService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatParticipationPermissions(private val chatBlockingService: ChatBlockingService,
                                   private val chatRoleService: ChatRoleService,
                                   private val chatParticipationService: ChatParticipationService,

                                   @Qualifier(CacheWrappersConfig.CHAT_BY_ID_CACHE_WRAPPER)
                                   private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
                                   private val authenticationHolder: ReactiveAuthenticationHolder<User>) {

    fun canJoinChat(chatId: String): Mono<Boolean> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId) { ChatNotFoundException("Could not find chat with id $chatId") }
                    .awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val chatRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId)
                    .awaitFirstOrNull()
            val userBlockedInChat = chatBlockingService
                    .isUserBlockedInChat(chatId = chatId, userId = currentUser.id)
                    .awaitFirst()

            return@mono chatRole == null && !userBlockedInChat
        }
    }

    fun canLeaveChat(chatId: String): Mono<Boolean> {
        return mono {
            val currentUserId = authenticationHolder.requireCurrentUserDetails().awaitFirst().id
            val currentUserRole = chatRoleService.getRoleOfUserInChat(userId = currentUserId, chatId = chatId).awaitFirstOrNull()

            return@mono currentUserRole != null
        }
    }

    fun canKickChatParticipant(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return mono {
            val kickedParticipant = chatParticipationService.findChatParticipationById(chatParticipationId).awaitFirst()

            if (kickedParticipant.chatId != chatId) {
                return@mono false
            }

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val currentUserRole = chatRoleService.getRoleOfUserInChat(userId = currentUser.id, chatId = chatId).awaitFirstOrNull()
                    ?: return@mono false

            if (!currentUserRole.features.kickUsers.enabled) {
                return@mono false
            }

            val otherUserRole = kickedParticipant.role

            return@mono !otherUserRole.features.kickImmunity.enabled
        }
    }

    fun canUpdateChatParticipant(chatId: String, chatParticipationId: String, updateChatParticipantRequest: UpdateChatParticipationRequest): Mono<Boolean> {
        return mono {
            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val (currentUserRole, currentUserChatParticipation) = chatRoleService.getRoleAndChatParticipationOfUserInChat(
                    userId = currentUser.id,
                    chatId = chatId
            )
                    .awaitFirstOrNull() ?: return@mono false;

            val chatRole = chatRoleService.findRoleByIdAndChatId(roleId = updateChatParticipantRequest.roleId, chatId = chatId).awaitFirst()
            val chatParticipation = chatParticipationService.findChatParticipationById(chatParticipationId).awaitFirst()

            if (currentUserChatParticipation.id === chatParticipation.id) {
                return@mono false
            }

            if (chatParticipation.chatId != chatId) {
                return@mono false
            }

            val assignRoleFeature = currentUserRole.features.assignChatRole

            if (!assignRoleFeature.enabled) {
                return@mono false
            }

            if (assignRoleFeature.additional.upToLevel == null) {
                return@mono true
            }

            return@mono assignRoleFeature.additional.upToLevel <= chatRole.level
        }
    }
}
