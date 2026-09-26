package chatox.chat.repository.mongodb

import chatox.chat.model.MessageReaction
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

interface MessageReactionRepository : ReactiveMongoRepository<MessageReaction, String> {
    fun findByUserIdAndMessageIdIn(userId: String, messageIds: List<String>): Flux<MessageReaction>
    fun findByUserIdAndMessageId(userId: String, messageId: String): Mono<MessageReaction>
    fun existsByUserIdAndMessageId(userId: String, messageId: String): Mono<Boolean>
    fun findByMessageId(messageId: String, pageable: Pageable): Flux<MessageReaction>
    fun findByMessageIdAndEmojiId(messageId: String, emojiId: String, pageable: Pageable): Flux<MessageReaction>
    fun findByMessageIdAndEmojiIdAndUserId(messageId: String, emojiId: String, userId: String): Mono<MessageReaction>
}