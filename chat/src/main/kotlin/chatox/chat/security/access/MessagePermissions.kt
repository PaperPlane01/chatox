package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.MessageService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class MessagePermissions(private val chatParticipationService: ChatParticipationService,
                         private val authenticationFacade: AuthenticationFacade) {

    private lateinit var messageService: MessageService

    @Autowired
    fun setMessageService(messageService: MessageService) {
        this.messageService = messageService
    }

    fun canCreateMessage(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .map { chatParticipationService.getRoleOfUserInChat(chatId = chatId, userId = it.id) }
                .flatMap { it }
                .switchIfEmpty(Mono.just(ChatRole.NOT_PARTICIPANT))
                .map { it != ChatRole.NOT_PARTICIPANT }
    }

    fun canUpdateMessage(messageId: String, chatId: String): Mono<Boolean> {
        return messageService.findMessageById(messageId)
                .zipWith(authenticationFacade.getCurrentUser())
                .map { it.t1.chatId == chatId && it.t1.sender.id == it.t2.id }
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
