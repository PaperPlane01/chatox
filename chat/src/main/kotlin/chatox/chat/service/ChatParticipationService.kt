package chatox.chat.service

import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.model.User
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationService {
    fun joinChat(chatId: String): Mono<ChatParticipationMinifiedResponse>
    fun leaveChat(chatId: String): Mono<Void>
    fun updateChatParticipation(id: String, chatId: String, updateChatParticipationRequest: UpdateChatParticipationRequest): Mono<ChatParticipationResponse>
    fun deleteChatParticipation(id: String, chatId: String): Mono<Void>
    fun findParticipantsOfChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse>
    fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse>
    fun findOnlineParticipants(chatId: String): Flux<ChatParticipationResponse>
    fun findParticipantsWithRole(chatId: String, roleId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
}
