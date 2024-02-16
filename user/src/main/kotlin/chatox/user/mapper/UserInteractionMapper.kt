package chatox.user.mapper

import chatox.user.api.response.UserInteractionResponse
import chatox.user.api.response.UserResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.UserInteraction
import chatox.user.messaging.rabbitmq.event.UserInteractionCreated
import chatox.user.util.findAndPutToCache
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserInteractionMapper(private val userCacheWrapper: UserReactiveRepositoryCacheWrapper,
                            private val userMapper: UserMapper) {

    fun toUserInteractionResponse(
            userInteraction: UserInteraction,
            localUsersCache: MutableMap<String, UserResponse>
    ): Mono<UserInteractionResponse> {
        return mono {
            val userProvider = createUserProvider(userInteraction.userId)
            val targetUserProvider = createUserProvider(userInteraction.targetUserId)
            val user = findAndPutToCache(userProvider, userInteraction.userId, localUsersCache).awaitFirst()
            val targetUser = findAndPutToCache(targetUserProvider, userInteraction.targetUserId, localUsersCache)
                    .awaitFirst()

            return@mono UserInteractionResponse(
                    id = userInteraction.id,
                    user = user,
                    targetUser = targetUser,
                    type = userInteraction.type,
                    createdAt = userInteraction.createdAt
            )
        }
    }

    fun toUserInteractionCreated(userInteraction: UserInteraction) = UserInteractionCreated(
            id = userInteraction.id,
            userId = userInteraction.userId,
            targetUserId = userInteraction.targetUserId,
            type = userInteraction.type,
            createdAt = userInteraction.createdAt,
            cost = userInteraction.cost
    )

    private fun createUserProvider(userId: String): () -> Mono<UserResponse> {
        return {
            userCacheWrapper.findById(userId).map { userMapper.toUserResponse(it) }
        }
    }
}