package chatox.chat.repository.mongodb.custom

import chatox.chat.model.ChatInvite
import org.springframework.data.domain.Pageable
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface ChatInviteCustomRepository {
    fun findById(id: String, activeOnly: Boolean): Mono<ChatInvite>
    fun findByIdAndChatId(id: String, chatId: String, activeOnly: Boolean): Mono<ChatInvite>
    fun findByChatId(chatId: String, activeOnly: Boolean, pageable: Pageable): Flux<ChatInvite>
    fun updateChatInviteUsage(
            chatInvite: ChatInvite,
            lastUsedBy: String,
            lastUsedAt: ZonedDateTime
    ): Mono<ChatInvite>
    fun updateChatInviteUsage(
            inviteId: String,
            lastUsedBy: String,
            lastUsedAt: ZonedDateTime,
            useTimesIncrease: Int
    ): Mono<ChatInvite>
}