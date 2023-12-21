package chatox.chat.repository.mongodb.custom

import chatox.chat.model.ChatInvite
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatInviteCustomRepository {
    fun findById(id: String, activeOnly: Boolean): Mono<ChatInvite>
    fun findByIdAndChatId(id: String, chatId: String, activeOnly: Boolean): Mono<ChatInvite>
    fun findByChatId(chatId: String, activeOnly: Boolean, pageable: Pageable): Flux<ChatInvite>
}