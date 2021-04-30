package chatox.chat.service

import chatox.chat.api.request.CreateChatRequest
import chatox.chat.api.request.DeleteChatRequest
import chatox.chat.api.request.UpdateChatRequest
import chatox.chat.api.response.AvailabilityResponse
import chatox.chat.api.response.ChatOfCurrentUserResponse
import chatox.chat.api.response.ChatResponse
import chatox.chat.api.response.ChatResponseWithCreatorId
import chatox.chat.model.Chat
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatService {
    fun createChat(createChatRequest: CreateChatRequest): Mono<ChatOfCurrentUserResponse>
    fun updateChat(id: String, updateChatRequest: UpdateChatRequest): Mono<ChatResponse>
    fun deleteChat(id: String, deleteChatRequest: DeleteChatRequest?): Mono<Void>
    fun findChatBySlugOrId(slugOrId: String): Mono<ChatResponse>
    fun searchChats(query: String, paginationRequest: PaginationRequest): Flux<ChatResponse>
    fun getChatsOfCurrentUser(): Flux<ChatOfCurrentUserResponse>
    fun isChatCreatedByUser(chatId: String, userId: String): Mono<Boolean>
    fun checkChatSlugAvailability(slug: String): Mono<AvailabilityResponse>
    fun getPopularChats(paginationRequest: PaginationRequest): Flux<ChatResponse>
    fun findChatEntityById(id: String): Mono<Chat>
    fun findChatById(id: String): Mono<ChatResponseWithCreatorId>
}
