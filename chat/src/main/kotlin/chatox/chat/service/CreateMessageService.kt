package chatox.chat.service

import chatox.chat.api.request.CreateMessageRequest
import chatox.chat.api.response.MessageResponse
import chatox.chat.model.ChatParticipation
import reactor.core.publisher.Mono

interface CreateMessageService {
    fun createMessage(chatId: String, createMessageRequest: CreateMessageRequest): Mono<MessageResponse>
    fun createFirstMessageForPrivateChat(chatId: String, createMessageRequest: CreateMessageRequest, chatParticipation: ChatParticipation): Mono<MessageResponse>
}