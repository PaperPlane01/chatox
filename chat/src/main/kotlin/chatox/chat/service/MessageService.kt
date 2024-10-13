package chatox.chat.service

import chatox.chat.api.request.DeleteMultipleMessagesRequest
import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.MessageInterface
import chatox.chat.model.MessageUpdateResult
import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.jwt.JwtPayload
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageService {
    fun updateMessage(id: String, chatId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse>
    fun <T: MessageInterface> updateMessage(message: T, updateMessageRequest: UpdateMessageRequest, updatedBy: JwtPayload? = null): Mono<MessageUpdateResult<T>>
    fun deleteMessage(id: String, chatId: String): Mono<Unit>
    fun findMessageById(id: String): Mono<MessageResponse>
    fun findMessageByIdAndChatId(id: String, chatId: String): Mono<MessageResponse>
    fun findMessagesByChat(chatId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesSinceMessageByChat(chatId: String, sinceMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun findMessagesBeforeMessageByChat(chatId: String, beforeMessageId: String, paginationRequest: PaginationRequest): Flux<MessageResponse>
    fun pinMessage(id: String, chatId: String): Mono<MessageResponse>
    fun unpinMessage(id: String, chatId: String): Mono<MessageResponse>
    fun findPinnedMessageByChat(chatId: String): Mono<MessageResponse>
    fun deleteMultipleMessages(deleteMultipleMessagesRequest: DeleteMultipleMessagesRequest): Mono<Unit>
}
