package chatox.chat.service

import chatox.chat.api.request.CreateChatBlockingRequest
import chatox.chat.api.request.UpdateChatBlockingRequest
import chatox.chat.api.response.ChatBlockingResponse
import chatox.chat.model.User
import chatox.platform.pagination.PaginationRequest
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface ChatBlockingService {
    fun blockUser(chatId: String, createChatBlockingRequest: CreateChatBlockingRequest): Mono<ChatBlockingResponse>
    fun unblockUser(chatId: String, blockingId: String): Mono<ChatBlockingResponse>
    fun updateBlocking(chatId: String, blockingId: String, updateBlockingRequest: UpdateChatBlockingRequest): Mono<ChatBlockingResponse>
    fun getBlockingById(chatId: String, blockingId: String): Mono<ChatBlockingResponse>
    fun getActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse>
    fun getNonActiveBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse>
    fun getAllBlockingsByChat(chatId: String, paginationRequest: PaginationRequest): Flux<ChatBlockingResponse>
    fun isUserBlockedInChat(chatId: String, user: User): Mono<Boolean>
    fun isUserBlockedInChat(chatId: String, userId: String): Mono<Boolean>
    fun findChatBlockingById(id: String): Mono<ChatBlockingResponse>
}
