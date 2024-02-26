package chatox.chat.repository.mongodb

import chatox.chat.model.UnreadMessagesCount
import chatox.chat.repository.mongodb.custom.UnreadMessagesCountCustomRepository
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface UnreadMessagesCountRepository : ReactiveMongoRepository<UnreadMessagesCount, String>, UnreadMessagesCountCustomRepository {
    fun findByChatParticipationId(chatParticipationId: String): Mono<UnreadMessagesCount>
    fun findByChatParticipationIdIn(chatParticipationIds: List<String>): Flux<UnreadMessagesCount>
    fun findByChatIdAndUserId(chatId: String, userId: String): Mono<UnreadMessagesCount>
}