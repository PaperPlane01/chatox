package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.model.ChatParticipation
import chatox.chat.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationRepository : ReactiveMongoRepository<ChatParticipation, String> {
    fun save(chatParticipation: ChatParticipation): Mono<ChatParticipation>
    override fun findById(id: String): Mono<ChatParticipation>
    fun findAllByUser(user: User): Flux<ChatParticipation>
    fun findByChat(chat: Chat, pageable: Pageable): Flux<ChatParticipation>
    fun findByChatAndUser(chat: Chat, user: User): Mono<ChatParticipation>
    fun findByChatAndUserFirstNameContains(chat: Chat, username: String, pageable: Pageable): Flux<ChatParticipation>
    fun countAllByChat(chat: Chat): Mono<Int>
    fun findByChatAndUserOnlineTrue(chat: Chat): Flux<ChatParticipation>
    fun countByChatAndUserOnlineTrue(chat: Chat): Mono<Int>
}
