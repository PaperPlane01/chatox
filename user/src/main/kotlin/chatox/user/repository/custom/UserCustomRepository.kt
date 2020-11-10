package chatox.user.repository.custom

import chatox.user.domain.User
import com.mongodb.client.result.UpdateResult
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface UserCustomRepository {
    fun findAndIncreaseActiveSessionsCount(userId: String, increaseValue: Int = 1): Mono<User>
    fun findAndDecreaseActiveSessionsCount(userId: String, decreaseValue: Int = 1): Mono<User>
    fun updateLastSeenDateIfNecessary(userId: String, lastSeen: ZonedDateTime): Mono<UpdateResult>
}
