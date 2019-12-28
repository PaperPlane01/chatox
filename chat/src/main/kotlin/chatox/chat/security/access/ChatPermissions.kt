package chatox.chat.security.access

import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatService
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatPermissions(private val authenticationFacade: AuthenticationFacade,
                      private val chatService: ChatService) {

    fun canUpdateChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .map { chatService.isChatCreatedByUser(chatId, userId = it.id) }
                .flatMap { it }
    }

    fun canDeleteChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .map { it.id }
                .map { chatService.isChatCreatedByUser(chatId, userId = it) }
                .flatMap { it }
    }
}
