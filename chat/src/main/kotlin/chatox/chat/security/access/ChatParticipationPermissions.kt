package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.ChatService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrDefault
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatParticipationPermissions(private val chatService: ChatService,
                                   private val chatBlockingService: ChatBlockingService,
                                   private val authenticationFacade: AuthenticationFacade) {
    private lateinit var chatParticipationService: ChatParticipationService

    @Autowired
    fun setChatParticipationService(chatParticipationService: ChatParticipationService) {
        this.chatParticipationService = chatParticipationService
    }

    fun canJoinChat(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatRole = chatParticipationService.getRoleOfUserInChat(
                    chatId = chatId,
                    user = currentUser
            )
                    .awaitFirstOrDefault(ChatRole.NOT_PARTICIPANT)
            val userBlockedInChat = chatBlockingService
                    .isUserBlockedInChat(chatId = chatId, user = currentUser)
                    .awaitFirst()

            chatRole == ChatRole.NOT_PARTICIPANT && !userBlockedInChat
        }
    }

    fun canLeaveChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .map { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .flatMap { it }
                .switchIfEmpty(Mono.just(ChatRole.NOT_PARTICIPANT))
                .map { it != ChatRole.NOT_PARTICIPANT }
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
        return chatService.findChatBySlugOrId(chatId)
                .zipWith(chatParticipationService.findChatParticipationById(chatParticipationId))
                .map { it.t1.createdByCurrentUser!! && it.t2.chatId == chatId }
    }
}
