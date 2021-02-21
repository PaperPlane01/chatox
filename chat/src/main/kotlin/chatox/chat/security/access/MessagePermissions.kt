package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.MessageService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Component
class MessagePermissions(private val chatParticipationService: ChatParticipationService,
                         private val chatBlockingService: ChatBlockingService,
                         private val authenticationFacade: AuthenticationFacade) {

    private lateinit var messageService: MessageService

    @Autowired
    fun setMessageService(messageService: MessageService) {
        this.messageService = messageService
    }

    fun canCreateMessage(chatId: String): Mono<Boolean> {
        return mono {
            val currentUserDetails = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipation = chatParticipationService.getMinifiedChatParticipation(chatId = chatId, user = currentUser)
                    .awaitFirstOrNull()

            if (chatParticipation == null) {
                false
            } else {
                (chatParticipation.role == ChatRole.MODERATOR || chatParticipation.role == ChatRole.ADMIN || chatParticipation.activeChatBlocking == null)
                        && !currentUserDetails.isBannedGlobally()
            }
        }
    }

    fun canUpdateMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val userBlockedInChat = chatBlockingService.isUserBlockedInChat(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirst()

            message.chatId == chatId
                    && !currentUser.isBannedGlobally()
                    && message.createdAt.plusDays(1L).isAfter(ZonedDateTime.now())
                    && message.sender.id == currentUser.id
                    && !userBlockedInChat
        }
    }

    fun canDeleteMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val userRoleInChat = chatParticipationService.getRoleOfUserInChat(message.chatId, currentUser).awaitFirst()

            message.chatId == chatId && (message.sender.id == currentUser.id || (userRoleInChat == ChatRole.ADMIN || userRoleInChat == ChatRole.MODERATOR))
        }
    }
}
