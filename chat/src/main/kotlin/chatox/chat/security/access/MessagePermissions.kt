package chatox.chat.security.access

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.model.ChatRole
import chatox.chat.model.ChatType
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.ChatService
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
    private lateinit var chatService: ChatService

    @Autowired
    fun setMessageService(messageService: MessageService) {
        this.messageService = messageService
    }

    @Autowired
    fun setChatService(chatService: ChatService) {
        this.chatService = chatService
    }

    fun canCreateMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<Boolean> {
        return mono {
            val currentUserDetails = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipation = chatParticipationService.getMinifiedChatParticipation(chatId = chatId, user = currentUser)
                    .awaitFirstOrNull()

            if (chatParticipation == null) {
                return@mono false
            } else {
                if (createMessageRequest.scheduledAt != null) {
                    return@mono canScheduleMessage(chatId).awaitFirst()
                } else {
                    return@mono (chatParticipation.role == ChatRole.MODERATOR || chatParticipation.role == ChatRole.ADMIN || chatParticipation.activeChatBlocking == null)
                            && !currentUserDetails.isBannedGlobally()
                }
            }
        }
    }

    fun canScheduleMessage(chatId: String): Mono<Boolean> {
        return mono {
            val currentUserDetails = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipation = chatParticipationService.getMinifiedChatParticipation(chatId = chatId, user = currentUser)
                    .awaitFirstOrNull()
                    ?: return@mono false

            return@mono chatParticipation.role == ChatRole.ADMIN && !currentUserDetails.isBannedGlobally()
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

    fun canPinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()

            if (message.pinned) {
                return@mono false
            }

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val userRoleInChat = chatParticipationService.getRoleOfUserInChat(message.chatId, currentUser).awaitFirst()

            return@mono message.chatId == chatId && userRoleInChat == ChatRole.ADMIN
        }
    }

    fun canUnpinMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val message = messageService.findMessageById(messageId).awaitFirst()

            if (!message.pinned) {
                return@mono false
            }

            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val userRoleInChat = chatParticipationService.getRoleOfUserInChat(message.chatId, currentUser).awaitFirst()

            return@mono message.chatId == chatId && userRoleInChat == ChatRole.ADMIN
        }
    }

    fun canSeeScheduledMessages(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val userRoleInChat = chatParticipationService.getRoleOfUserInChat(chatId, currentUser).awaitFirst()

            return@mono userRoleInChat == ChatRole.ADMIN
        }
    }

    fun canUpdateScheduledMessage(messageId: String, chatId: String): Mono<Boolean> {
        return mono {
            val currentUserDetails = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val currentUser = authenticationFacade.getCurrentUser().awaitFirst()
            val chatParticipation = chatParticipationService.getMinifiedChatParticipation(chatId = chatId, user = currentUser)
                    .awaitFirstOrNull()
                    ?: return@mono false
            val message = messageService.findScheduledMessageById(messageId).awaitFirst()

            return@mono message.chatId == chatId && chatParticipation.role === ChatRole.ADMIN && !currentUserDetails.isBannedGlobally()
        }
    }

    fun canReadMessages(chatId: String): Mono<Boolean> {
        return mono{
            val chat = chatService.findChatById(chatId).awaitFirst()

            if (chat.type == ChatType.GROUP) {
                return@mono true
            } else {
                val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirstOrNull() ?: return@mono false
                val userRoleInChat = chatParticipationService.getRoleOfUserInChat(chatId,  currentUser.id).awaitFirst()

                return@mono userRoleInChat != ChatRole.NOT_PARTICIPANT
            }
        }
    }
}
