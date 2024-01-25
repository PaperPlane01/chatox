package chatox.chat.repository.mongodb

import chatox.chat.model.PendingChatParticipation
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface PendingChatParticipationRepository : ReactiveMongoRepository<PendingChatParticipation, String> {
    fun findByChatIdOrderByCreatedAtAsc(chatId: String, pageable: Pageable): Flux<PendingChatParticipation>
    fun findByUserIdOrderByCreatedAtAsc(userId: String): Flux<PendingChatParticipation>
    fun findByChatIdAndIdIn(chatId: String, ids: List<String>): Flux<PendingChatParticipation>
    fun existsByChatIdAndUserId(chatId: String, userId: String): Mono<Boolean>
    fun findByChatIdAndInviteId(chatId: String, inviteId: String, pageable: Pageable): Flux<PendingChatParticipation>
}