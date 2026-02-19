package chatox.user.mapper

import chatox.user.api.response.UserInteractionCostFullResponse
import chatox.user.api.response.UserInteractionCostResponse
import chatox.user.api.response.UserResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.UserInteractionCost
import chatox.user.util.findAndPutToCache
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class UserInteractionCostMapper(
    private val userCacheWrapper: UserReactiveRepositoryCacheWrapper,
    private val userMapper: UserMapper
) {

    fun toUserInteractionCostResponse(userInteractionCost: UserInteractionCost) = UserInteractionCostResponse(
        cost = userInteractionCost.cost,
        type = userInteractionCost.type
    )

    fun toUserInteractionCostFullResponse(
        userInteractionCost: UserInteractionCost,
        localUsersCache: MutableMap<String, UserResponse> = mutableMapOf()
    ): Mono<UserInteractionCostFullResponse> {
        return mono {
            return@mono UserInteractionCostFullResponse(
                type = userInteractionCost.type,
                cost = userInteractionCost.cost,
                createdAt = userInteractionCost.createdAt,
                createdBy = userInteractionCost.updatedById?.let {
                    findAndPutToCache(
                        { userCacheWrapper.findById(it).map(userMapper::toUserResponse) },
                        it,
                        localUsersCache
                    )
                        .awaitFirst()
                },
                updatedAt = userInteractionCost.updatedAt,
                updatedBy = userInteractionCost.updatedById?.let {
                    findAndPutToCache(
                        { userCacheWrapper.findById(it).map(userMapper::toUserResponse) },
                        it,
                        localUsersCache
                    )
                        .awaitFirst()
                }
            )
        }
    }
}