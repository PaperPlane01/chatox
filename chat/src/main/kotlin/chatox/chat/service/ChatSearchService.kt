package chatox.chat.service

import chatox.chat.api.response.ChatResponse
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatSearchService {
    fun searchChatsOfCurrentUser(query: String): Flux<ChatResponse>
    fun importChatsToElasticsearch(deleteIndex: Boolean = false): Mono<Unit>
}