package chatox.chat.service

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.CountMessagesResponse
import chatox.chat.api.response.MessageResponse
import chatox.chat.support.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageService {
    fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse>
    fun updateMessage(id: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse>
    fun deleteMessage(id: String): Mono<Void>
    fun findMessageById(id: String): Mono<MessageResponse>
    fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesSinceMessageByChat(chatId: String, sinceMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesBeforeMessageByChat(chatId: String, beforeMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun markMessageRead(messageId: String): Mono<Void>
}
