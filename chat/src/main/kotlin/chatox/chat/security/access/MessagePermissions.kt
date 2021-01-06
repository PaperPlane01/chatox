package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatBlockingService
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.MessageService
import kotlinx.coroutines.reactive.awaitFirst
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
        return authenticationFacade.getCurrentUser()
                .flatMap { chatParticipationService.getMinifiedChatParticipation(chatId, it) }
                .map {
                    it.role == ChatRole.MODERATOR
                            || it.role == ChatRole.ADMIN
                            || it.activeChatBlocking == null
                }
                .switchIfEmpty(Mono.just(false))
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
                    && message.createdAt.plusDays(1L).isAfter(ZonedDateTime.now())
                    && message.sender.id == currentUser.id
                    && !userBlockedInChat
        }
    }

    fun canDeleteMessage(messageId: String, chatId: String): Mono<Boolean> {
        var currentUser: User? = null

        return messageService.findMessageById(messageId)
                .zipWith(authenticationFacade.getCurrentUser().map {
                    currentUser = it
                    chatParticipationService.getRoleOfUserInChat(chatId, it)
                })
                .map { it.t2.zipWith(Mono.just(it.t1)) }
                .flatMap { it }
                .map { it.t2.chatId == chatId
                        && (it.t2.sender.id == currentUser!!.id || (it.t1 == ChatRole.ADMIN || it.t1 == ChatRole.MODERATOR))
                }
    }
}
