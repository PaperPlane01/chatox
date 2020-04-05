package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatParticipationService
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatBlockingPermissions(private val chatParticipationService: ChatParticipationService,
                              private val authenticationFacade: AuthenticationFacade) {

    fun canBlockUser(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .flatMap { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .map { it == ChatRole.ADMIN || it == ChatRole.MODERATOR }
    }

    fun canUnblockUser(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .flatMap { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .map { it == ChatRole.ADMIN || it == ChatRole.MODERATOR }
    }

    fun canSeeChatBlockings(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUserDetails()
                .filter { it.authorities.map { authority -> authority.authority }.contains("ROLE_USER") }
                .flatMap { authenticationFacade.getCurrentUser() }
                .flatMap { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .map { it == ChatRole.ADMIN || it == ChatRole.MODERATOR }
                .switchIfEmpty(Mono.just(false))

    }

    fun canUpdateBlocking(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .flatMap { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .map { it == ChatRole.ADMIN || it == ChatRole.USER }
    }
}
