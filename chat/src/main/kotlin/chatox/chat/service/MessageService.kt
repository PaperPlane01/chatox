package chatox.chat.service

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Message
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageService {
    fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse>
    fun updateMessage(id: String, chatId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse>
    fun deleteMessage(id: String, chatId: String): Mono<Void>
    fun findMessageById(id: String): Mono<MessageResponse>
    fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesSinceMessageByChat(chatId: String, sinceMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesBeforeMessageByChat(chatId: String, beforeMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun markMessageRead(messageId: String): Mono<Void>
    fun pinMessage(id: String, chatId: String): Mono<MessageResponse>
    fun unpinMessage(id: String, chatId: String): Mono<MessageResponse>
    fun findPinnedMessageByChat(chatId: String): Mono<MessageResponse>
}
