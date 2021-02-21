package chatox.chat.security.access

import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatPermissions(private val authenticationFacade: AuthenticationFacade) {
    private lateinit var chatService: ChatService

    @Autowired
    fun setChatService(chatService: ChatService) {
        this.chatService = chatService
    }

    fun canUpdateChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .map { chatService.isChatCreatedByUser(chatId, userId = it.id) }
                .flatMap { it }
    }

    fun canDeleteChat(chatId: String): Mono<Boolean> {
        return mono {
            val currentUser = authenticationFacade.getCurrentUserDetails().awaitFirst()
            val chatCreatedByCurrentUser = chatService.isChatCreatedByUser(
                    chatId = chatId,
                    userId = currentUser.id
            )
                    .awaitFirst()

            chatCreatedByCurrentUser || currentUser.isAdmin()
        }
    }

    fun canCreateChat(): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .map { user -> user.isBannedGlobally() }
    }
}
