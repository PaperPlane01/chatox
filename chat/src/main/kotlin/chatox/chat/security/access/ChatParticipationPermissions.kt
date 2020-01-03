package chatox.chat.security.access

import chatox.chat.model.ChatRole
import chatox.chat.security.AuthenticationFacade
import chatox.chat.service.ChatParticipationService
import chatox.chat.service.ChatService
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class ChatParticipationPermissions(private val chatParticipationService: ChatParticipationService,
                                   private val chatService: ChatService,
                                   private val authenticationFacade: AuthenticationFacade) {

    fun canJoinChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .map { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .flatMap { it }
                .switchIfEmpty(Mono.just(ChatRole.NOT_PARTICIPANT))
                .map { it == ChatRole.NOT_PARTICIPANT }
    }

    fun canLeaveChat(chatId: String): Mono<Boolean> {
        return authenticationFacade.getCurrentUser()
                .map { chatParticipationService.getRoleOfUserInChat(chatId, it) }
                .flatMap { it }
                .switchIfEmpty(Mono.just(ChatRole.NOT_PARTICIPANT))
                .map { it != ChatRole.NOT_PARTICIPANT }
    }

    fun canKickChatParticipant(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return chatParticipationService.findChatParticipationById(chatParticipationId)
                .zipWith(authenticationFacade.getCurrentUser().map { user -> chatParticipationService.getRoleOfUserInChat(chatId, user) } )
                .map { it.t2.zipWith(Mono.just(it.t1)) }
                .flatMap { it }
                .map { (it.t2.chatId == chatId)
                        && (it.t2.role != ChatRole.ADMIN && it.t2.role != ChatRole.MODERATOR)
                        && (it.t1 == ChatRole.ADMIN || it.t1 == ChatRole.MODERATOR)
                }
    }

    fun canUpdateChatParticipant(chatId: String, chatParticipationId: String): Mono<Boolean> {
        return chatService.findChatBySlugOrId(chatId)
                .zipWith(chatParticipationService.findChatParticipationById(chatParticipationId))
                .map { it.t1.createdByCurrentUser!! && it.t2.chatId == chatId }
    }
}