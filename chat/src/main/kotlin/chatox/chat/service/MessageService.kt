package chatox.chat.service

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.support.pagination.PagedResponse
import chatox.chat.support.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageService {
    fun createMessage(createMessageRequest: CreateMessageRequest): Mono<MessageResponse>
    fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<PagedResponse<MessageResponse>>
    fun updateMessage(messageId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse>
    fun deleteMessage(messageId: String): Mono<Void>
}
