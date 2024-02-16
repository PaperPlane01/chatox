package chatox.chat.service

import chatox.chat.api.request.UpdateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.api.response.UserResponse
import chatox.chat.model.ScheduledMessage
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ScheduledMessageService {
    fun findScheduledMessageById(messageId: String): Mono<MessageResponse>
    fun findScheduledMessagesByChat(chatId: String): Flux<MessageResponse>
    fun publishScheduledMessage(chatId: String, messageId: String): Mono<MessageResponse>
    fun publishScheduledMessage(scheduledMessage: ScheduledMessage, localUsersCache: MutableMap<String, UserResponse>? = null, localReferredMessagesCache: MutableMap<String, MessageResponse>? = null): Mono<MessageResponse>
    fun deleteScheduledMessage(chatId: String, messageId: String): Mono<Unit>
    fun updateScheduledMessage(chatId: String, messageId: String, updateMessageRequest: UpdateMessageRequest): Mono<MessageResponse>
}