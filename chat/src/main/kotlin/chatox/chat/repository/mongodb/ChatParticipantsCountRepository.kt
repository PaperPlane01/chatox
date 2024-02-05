package chatox.chat.repository.mongodb

import chatox.chat.model.ChatParticipantsCount
import chatox.chat.repository.mongodb.custom.ChatParticipantsCountCustomRepository
import chatox.chat.repository.mongodb.custom.ChatParticipationCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipantsCountRepository : ReactiveMongoRepository<ChatParticipantsCount, String>,
        ChatParticipantsCountCustomRepository {
    fun findByChatId(chatId: String): Mono<ChatParticipantsCount>
    fun findByChatIdIn(chatIds: List<String>): Flux<ChatParticipantsCount>
    fun findByHideFromSearchFalse(pageable: Pageable): Flux<ChatParticipantsCount>
}