package chatox.chat.service

import chatox.chat.api.response.MessageReactionResponse
import chatox.platform.pagination.PaginationRequest
import chatox.platform.text.api.response.EmojiInfo
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageReactionService {
    fun addReaction(messageId: String, emojiId: String): Mono<MessageReactionResponse>
    fun deleteReaction(messageId: String, emojiId: String): Mono<Unit>
    fun getReactions(messageId: String, paginationRequest: PaginationRequest): Flux<MessageReactionResponse>
    fun getReactions(messageId: String, emojiId: String, paginationRequest: PaginationRequest): Flux<MessageReactionResponse>
}