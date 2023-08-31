package chatox.user.mapper

import chatox.user.api.response.UserInteractionCostFullResponse
import chatox.user.api.response.UserInteractionCostResponse
import chatox.user.api.response.UserResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.UserInteractionCost
import chatox.user.service.UserService
import chatox.user.util.findAndPutToCache
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserInteractionCostMapper(
        private val userCacheWrapper: UserReactiveRepositoryCacheWrapper,
        private val userService: UserService,
        private val userMapper: UserMapper) {

    fun toUserInteractionCostResponse(userInteractionCost: UserInteractionCost) = UserInteractionCostResponse(
            cost = userInteractionCost.cost,
            type = userInteractionCost.type
    )

    fun toUserInteractionCostFullResponse(userInteractionCost: UserInteractionCost,
                                          localUsersCache: MutableMap<String, UserResponse> = mutableMapOf()
    ): Mono<UserInteractionCostFullResponse> {
        return mono {
            val createdBy = if (userInteractionCost.createdById == null) {
                null
            } else findAndPutToCache(
                    { userCacheWrapper.findById(userInteractionCost.createdById).map(userMapper::toUserResponse) },
                    userInteractionCost.createdById,
                    localUsersCache
            )
                    .awaitFirst()

            val updatedBy = if (userInteractionCost.updatedById == null) {
                null
            } else findAndPutToCache(
                    { userCacheWrapper.findById(userInteractionCost.updatedById).map(userMapper::toUserResponse) },
                    userInteractionCost.updatedById,
                    localUsersCache
            )
                    .awaitFirst()

            return@mono UserInteractionCostFullResponse(
                    type = userInteractionCost.type,
                    cost = userInteractionCost.cost,
                    createdAt =  userInteractionCost.createdAt,
                    createdBy = createdBy,
                    updatedAt = userInteractionCost.updatedAt,
                    updatedBy = updatedBy
            )
        }
    }
}