package chatox.chat.security.access

import chatox.chat.exception.metadata.ChatDeletedException
import chatox.chat.exception.metadata.ChatNotFoundException
import chatox.chat.model.Chat
import chatox.chat.model.ChatRole
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.ChatService
import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrDefault
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatParticipationPermissions(private val chatService: ChatService,
                                   private val chatBlockingService: ChatBlockingService,
                                   private val chatCacheWrapper: ReactiveRepositoryCacheWrapper<Chat, String>,
                                   private val authenticationFacade: AuthenticationFacade) {
    private lateinit var chatParticipationService: ChatParticipationService

    @Autowired
    fun setChatParticipationService(chatParticipationService: ChatParticipationService) {
        this.chatParticipationService = chatParticipationService
    }

    fun canJoinChat(chatId: String): Mono<Boolean> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId) { ChatNotFoundException("Could not find chat with id $chatId")}
                    .awaitFirst()

            if (chat.deleted) {
                throw ChatDeletedException(chat.chatDeletion)
            }

            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val chatRole = chatParticipationService.getRoleOfUserInChat(
                    chatId = chat.id,
                    userId = currentUser.id
            )
                    .awaitFirstOrDefault(ChatRole.NOT_PARTICIPANT)
            val userBlockedInChat = chatBlockingService
                    .isUserBlockedInChat(chatId = chatId, userId = currentUser.id)
                    .awaitFirst()

            chatRole == ChatRole.NOT_PARTICIPANT && !userBlockedInChat
        }
    }

    fun canLeaveChat(chatId: String): Mono<Boolean> {
        return mono {
            val chat = chatCacheWrapper.findById(chatId) { ChatNotFoundException("Could not find chat with id $chatId") }
                    .awaitFirst()
            val currentUserId = authenticationFacade.getCurrentUserDetails().awaitFirst().id
            val currentUserRole = chatParticipationService.getRoleOfUserInChat(chat.id, currentUserId)
                    .awaitFirstOrDefault(ChatRole.NOT_PARTICIPANT)

            currentUserRole != ChatRole.NOT_PARTICIPANT
        }
    }

    fun canKickChatParticipant(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return mono {
            val kickedParticipant = chatParticipationService.findChatParticipationById(chatParticipationId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatRoleOfCurrentUser = chatParticipationService.getRoleOfUserInChat(chatId, currentUser).awaitFirst()

            kickedParticipant.chatId == chatId &&
                    ((chatRoleOfCurrentUser == ChatRole.MODERATOR || chatRoleOfCurrentUser == ChatRole.ADMIN)
                            && (kickedParticipant.role !== ChatRole.MODERATOR && kickedParticipant.role !== ChatRole.ADMIN))
        }
    }

    fun canUpdateChatParticipant(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return mono {
            val chat = chatService.findChatBySlugOrId(chatId).awaitFirst()
            val chatParticipation = chatParticipationService.findChatParticipationById(chatParticipationId).awaitFirst()

            println(chat.createdByCurrentUser)

            return@mono chat.createdByCurrentUser!! && chatParticipation.chatId == chat.id;
        }
    }
}
