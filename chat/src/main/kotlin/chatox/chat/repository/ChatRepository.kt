package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.repository.custom.ChatCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRepository : ReactiveMongoRepository<Chat, String>, ChatCustomRepository {
    fun save(chat: Chat): Mono<Chat>
    override fun findById(id: String): Mono<Chat>
    fun existsBySlugOrId(slug: String, id: String): Mono<Boolean>
    fun findByIdEqualsOrSlugEquals(id: String, slug: String): Mono<Chat>
    fun findByNameContainsOrDescriptionContainsOrTagsContains(name: String, description: String, tags: String, pageable: Pageable): Flux<Chat>
    fun findAllBy(pageable: Pageable): Flux<Chat>
}
