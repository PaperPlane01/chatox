package chatox.chat.service

import chatox.chat.api.response.MessageResponse
import chatox.chat.model.Message
import reactor.core.publisher.Mono

interface MessageEntityService {
    fun deleteMessage(message: Message): Mono<Unit>
    fun deleteMultipleMessages(messages: List<Message>): Mono<Unit>
    fun updateMessage(message: Message): Mono<MessageResponse>
    fun findMessageEntityById(id: String): Mono<Message>
    fun findMessageEntityById(id: String, retrieveFromCache: Boolean, throwIfNotFound: Boolean): Mono<Message>
}