package chatox.chat.repository

import chatox.chat.model.Chat
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
    fun findAllByUser(user: User): Flux<ChatParticipation>
    fun findAllByUserAndDeletedFalse(user: User): Flux<ChatParticipation>
    fun findByChat(chat: Chat, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatAndDeletedFalse(chat: Chat, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatAndUser(chat: Chat, user: User): Mono<ChatParticipation>
    fun findByChatAndUserAndDeletedFalse(chat: Chat, user: User): Mono<ChatParticipation>
    fun findByChatAndUserAndDeletedTrue(chat: Chat, user: User): Mono<ChatParticipation>
    fun countAllByChat(chat: Chat): Mono<Int>
    fun countByChatAndDeletedFalse(chat: Chat): Mono<Int>
    fun findByChatAndUserOnlineTrue(chat: Chat): Flux<ChatParticipation>
    fun countByChatAndUserOnlineTrue(chat: Chat): Mono<Int>

    @Query("{'chat' : :#{#chat}, 'userDisplayedName': {'\$regex': :#{#query}, '\$options' : 'i' }, 'deleted': false }")
    fun searchChatParticipants(@Param("chat") chat: Chat, @Param("query") query: String, pageable: Pageable): Flux<ChatParticipation>
}
