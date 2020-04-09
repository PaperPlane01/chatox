package chatox.chat.service

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.model.ChatRole
import chatox.chat.model.User
import chatox.chat.support.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationService {
    fun joinChat(chatId: String): Mono<ChatParticipationMinifiedResponse>
    fun leaveChat(chatId: String): Mono<Void>
    fun updateChatParticipation(id: String, updateChatParticipationRequest: UpdateChatParticipationRequest): Mono<ChatParticipationResponse>
    fun deleteChatParticipation(id: String): Mono<Void>
    fun findParticipantsOfChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun getRoleOfUserInChat(chatId: String, user: User): Mono<ChatRole>
    fun getRoleOfUserInChat(chatId: String, userId: String): Mono<ChatRole>
    fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse>
    fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse>
}
