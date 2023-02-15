package chatox.user.repository.custom

import com.mongodb.client.result.UpdateResult
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

interface UserCustomRepository {
    fun updateLastSeenDateIfNecessary(userId: String, lastSeen: ZonedDateTime): Mono<UpdateResult>
}
