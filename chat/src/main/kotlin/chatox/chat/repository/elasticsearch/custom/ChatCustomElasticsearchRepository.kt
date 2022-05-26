package chatox.chat.repository.elasticsearch.custom

import chatox.chat.model.User
import chatox.chat.model.elasticsearch.ChatElasticsearch
import reactor.core.publisher.Flux

interface ChatCustomElasticsearchRepository {
    fun searchChatsOfUser(query: String, chatIds: List<String>, user: User): Flux<ChatElasticsearch>
}