package chatox.chat.repository.mongodb

import chatox.chat.model.Chat
import chatox.chat.model.ChatType
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.data.repository.query.Param
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatRepository : ReactiveMongoRepository<Chat, String> {
    fun save(chat: Chat): Mono<Chat>
    override fun findById(id: String): Mono<Chat>
    fun existsBySlugOrId(slug: String, id: String): Mono<Boolean>
    fun findByIdEqualsOrSlugEquals(id: String, slug: String): Mono<Chat>
    fun findAllByDeletedFalseAndTypeIn(types: List<ChatType>, pageable: Pageable): Flux<Chat>
    fun findByDialogDisplayOtherParticipantUserId(userId: String): Flux<Chat>
    fun findByAvatarId(id: String): Flux<Chat>
    fun findByIdInAndTypeInAndDeletedFalse(ids: List<String>, types: List<ChatType>): Flux<Chat>

    @Query(
            "{\n" +
                      "'\$or':\n" +
                        "[\n" +
                          "{'name': {'\$regex': :#{#searchQuery}, '\$options': 'i'}},\n" +
                          "{'description': {'\$regex': :#{#searchQuery}, '\$options': 'i'}},\n" +
                          "{'tags': :#{#searchQuery}}\n"+
                        "],\n" +
                      "'deleted': false\n" +
                      "'type': {" +
                          "\$in: :#{#typesToInclude}" +
                        "}\n" +
                    "}"
    )
    fun searchChats(@Param("searchQuery") searchQuery: String, @Param("typesToInclude") typesToInclude: List<ChatType>, pageable: Pageable): Flux<Chat>
}
