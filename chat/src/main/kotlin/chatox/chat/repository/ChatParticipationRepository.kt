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
    fun findByChat(chat: Chat, pageable: Pageable): Mono<Page<ChatParticipation>>
    fun findByChatAndUserFirstNameContains(chat: Chat, username: String, pageable: Pageable): Mono<Page<ChatParticipation>>
    fun countAllByChat(chat: Chat): Mono<Int>
}
