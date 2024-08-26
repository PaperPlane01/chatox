package chatox.chat.service

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.request.ForwardMessagesRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.ChatParticipation
import chatox.chat.model.Message
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface CreateMessageService {
    fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse>
    fun createFirstMessageForPrivateChat(chatId: String, createMessageRequest: CreateMessageRequest, chatParticipation: ChatParticipation): Mono<Message>
    fun forwardMessages(chatId: String, forwardMessagesRequest: ForwardMessagesRequest): Flux<MessageResponse>
}