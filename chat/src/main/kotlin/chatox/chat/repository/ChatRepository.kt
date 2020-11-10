package chatox.chat.repository

import chatox.chat.model.Chat
import chatox.chat.repository.custom.ChatCustomRepository
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.query.Param
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRepository : ReactiveMongoRepository<Chat, String>, ChatCustomRepository {
    fun save(chat: Chat): Mono<Chat>
    override fun findById(id: String): Mono<Chat>
    fun existsBySlugOrId(slug: String, id: String): Mono<Boolean>
    fun findByIdEqualsOrSlugEquals(id: String, slug: String): Mono<Chat>
    fun findAllByDeletedFalse(pageable: Pageable): Flux<Chat>

    @Query(
            "{\n" +
                      "'\$or':\n" +
                        "[\n" +
                          "{'name': {'\$regex': :#{#searchQuery}, '\$options': 'i'}},\n" +
                          "{'description': {'\$regex': :#{#searchQuery}, '\$options: 'i'}},\n" +
                          "{'tags': :#{#searchQuery}}\n"+
                        "],\n" +
                      "'deleted': false\n" +
                    "}"
    )
    fun searchChats(@Param("searchQuery") searchQuery: String, pageable: Pageable): Flux<Chat>
}
