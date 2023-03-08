package chatox.chat.service

import chatox.chat.api.response.MessageResponse
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageSearchService {
    fun searchMessages(text: String, chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun searchMessagesInChatsOfCurrentUser(text: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun importMessagesToElasticsearch(): Mono<Void>
}