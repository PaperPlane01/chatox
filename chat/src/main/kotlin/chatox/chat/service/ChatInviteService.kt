package chatox.chat.service

import chatox.chat.api.request.CreateChatInviteRequest
import chatox.chat.api.request.UpdateChatInviteRequest
import chatox.chat.api.response.ChatInviteFullResponse
import chatox.chat.api.response.ChatInviteResponse
import chatox.chat.api.response.ChatInviteUsageResponse
import chatox.chat.model.ChatInvite
import chatox.chat.model.ChatParticipation
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatInviteService {
    fun findChatInvite(id: String): Mono<ChatInviteResponse>
    fun findFullChatInvite(chatId: String, id: String): Mono<ChatInviteFullResponse>
    fun findChatInvites(chatId: String, activeOnly: Boolean, paginationRequest: PaginationRequest): Flux<ChatInviteFullResponse>
    fun createChatInvite(chatId: String, createChatInviteRequest: CreateChatInviteRequest): Mono<ChatInviteFullResponse>
    fun updateChatInvite(id: String, chatId: String, updateChatInviteRequest: UpdateChatInviteRequest): Mono<ChatInviteFullResponse>
    fun getChatInviteUsageInfo(chatInvite: ChatInvite): Mono<ChatInviteUsageResponse>
    fun updateChatInviteFromApprovedChatParticipations(chatParticipations: List<ChatParticipation>): Mono<Unit>
}