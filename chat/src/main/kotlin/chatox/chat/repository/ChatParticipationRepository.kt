package chatox.chat.repository

import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import chatox.chat.repository.custom.ChatParticipationCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.query.Param
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationRepository : ReactiveMongoRepository<ChatParticipation, String>,
        ChatParticipationCustomRepository {
    fun save(chatParticipation: ChatParticipation): Mono<ChatParticipation>
    override fun findById(id: String): Mono<ChatParticipation>
    fun findByIdAndDeletedFalse(id: String): Mono<ChatParticipation>
    fun findAllByUserIdAndDeletedFalse(userId: String): Flux<ChatParticipation>
    fun findByChatIdAndDeletedFalse(chatId: String): Flux<ChatParticipation>
    fun findByChatIdAndDeletedFalse(chatId: String, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatIdAndUser(chatId: String, user: User): Mono<ChatParticipation>
    fun findByChatIdAndUserId(chatId: String, userId: String): Mono<ChatParticipation>
    fun findByChatIdAndUserIdAndDeletedFalse(chatId: String, userId: String): Mono<ChatParticipation>
    fun findByChatIdAndUserAndDeletedTrue(chatId: String, user: User): Mono<ChatParticipation>
    fun findByChatIdAndUserOnlineTrue(chatId: String): Flux<ChatParticipation>
    fun findByIdAndChatId(id: String, chatId: String): Mono<ChatParticipation>

    @Query("{'chatId' : :#{#chatId}, 'userDisplayedName': {'\$regex': :#{#query}, '\$options' : 'i' }, 'deleted': false }")
    fun searchChatParticipants(@Param("chatId") chatId: String, @Param("query") query: String, pageable: Pageable): Flux<ChatParticipation>
}
