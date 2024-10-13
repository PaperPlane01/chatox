package chatox.chat.service

import chatox.chat.api.request.PendingChatParticipantsRequest
import chatox.chat.api.request.UpdateChatParticipationRequest
import chatox.chat.api.response.ChatParticipationMinifiedResponse
import chatox.chat.api.response.ChatParticipationResponse
import chatox.chat.api.response.PendingChatParticipationResponse
import chatox.chat.model.ChatParticipation
import chatox.chat.model.TextInfo
import chatox.chat.model.User
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatParticipationService {
    fun joinChat(chatId: String, inviteId: String? = null): Mono<ChatParticipationMinifiedResponse>
    fun leaveChat(chatId: String): Mono<Unit>
    fun updateChatParticipation(id: String, chatId: String, updateChatParticipationRequest: UpdateChatParticipationRequest): Mono<ChatParticipationResponse>
    fun deleteChatParticipation(id: String, chatId: String): Mono<Unit>
    fun findParticipantsOfChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun searchChatParticipants(chatId: String, query: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun findChatParticipationById(participationId: String): Mono<ChatParticipationResponse>
    fun getMinifiedChatParticipation(chatId: String, user: User): Mono<ChatParticipationMinifiedResponse>
    fun findOnlineParticipants(chatId: String): Flux<ChatParticipationResponse>
    fun findParticipantsWithRole(chatId: String, roleId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun findPendingChatParticipations(chatId: String, paginationRequest: PaginationRequest): Flux<PendingChatParticipationResponse>
    fun approveChatParticipants(chatId: String, pendingChatParticipantsRequest: PendingChatParticipantsRequest): Flux<ChatParticipationResponse>
    fun rejectChatParticipants(chatId: String, pendingChatParticipantsRequest: PendingChatParticipantsRequest): Mono<Unit>
    fun findChatParticipationsByInvite(chatId: String, inviteId: String, paginationRequest: PaginationRequest): Flux<ChatParticipationResponse>
    fun findPendingChatParticipationsByInvite(chatId: String, inviteId: String, paginationRequest: PaginationRequest): Flux<PendingChatParticipationResponse>
    fun getMentionedChatParticipants(chatId: String, textInfo: TextInfo, excludedUsersIds: List<String>): Flux<ChatParticipation>
}
