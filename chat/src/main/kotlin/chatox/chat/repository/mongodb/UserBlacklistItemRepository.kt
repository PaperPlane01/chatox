package chatox.chat.repository

import chatox.chat.model.UserBlacklistItem
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UserBlacklistItemRepository : ReactiveMongoRepository<UserBlacklistItem, String> {
    fun existsByUserIdAndBlacklistedById(userId: String, blacklistedById: String): Mono<Boolean>
    fun deleteByUserIdAndBlacklistedById(userId: String, blacklistedById: String): Mono<Void>
    fun findByUserIdAndBlacklistedById(userId: String, blacklistedById: String): Mono<UserBlacklistItem>
}