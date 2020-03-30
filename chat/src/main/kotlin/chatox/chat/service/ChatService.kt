package chatox.chat.service

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.support.pagination.PagedResponse
import chatox.chat.support.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatService {
    fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse>
    fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse>
    fun deleteChat(id: String): Mono<Void>
    fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse>
    fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse>
    fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse>
    fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean>
    fun checkChatSlugAvailability(slug: String): Mono<AvailabilityResponse>
}
