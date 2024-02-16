package chatox.user.service.impl

import chatox.platform.cache.ReactiveRepositoryCacheWrapper
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.api.request.UserInteractionCostRequest
import chatox.user.api.response.UserInteractionCostFullResponse
import chatox.user.api.response.UserInteractionCostResponse
import chatox.user.api.response.UserResponse
import chatox.user.config.property.UserInteractionCostConfigProperties
import chatox.user.domain.User
import chatox.user.domain.UserInteractionCost
import chatox.user.domain.UserInteractionType
import chatox.user.mapper.UserInteractionCostMapper
import chatox.user.repository.UserInteractionCostRepository
import chatox.user.service.UserInteractionCostService
import jakarta.annotation.PostConstruct
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.math.BigDecimal
import java.time.ZonedDateTime
import java.util.function.Function
import java.util.stream.Collectors

@Service
class UserInteractionCostServiceImpl(
        private val userInteractionCostRepository: UserInteractionCostRepository,
        private val userInteractionCostCacheWrapper: ReactiveRepositoryCacheWrapper<UserInteractionCost, String>,
        private val userInteractionCostMapper: UserInteractionCostMapper,
        private val reactiveAuthenticationHolder: ReactiveAuthenticationHolder<User>,
        private val userInteractionCostConfigProperties: UserInteractionCostConfigProperties
) : UserInteractionCostService {
    private val log = LoggerFactory.getLogger(this.javaClass)

    override fun getUserInteractionCosts(): Flux<UserInteractionCostResponse> {
        return userInteractionCostRepository
                .findAll()
                .map { userInteractionCost -> userInteractionCostMapper.toUserInteractionCostResponse(userInteractionCost) }
    }

    override fun getFullUserInteractionCosts(): Flux<UserInteractionCostFullResponse> {
        val localUsersCache = mutableMapOf<String, UserResponse>()

        return userInteractionCostRepository
                .findAll()
                .flatMap { userInteractionCost -> userInteractionCostMapper.toUserInteractionCostFullResponse(
                        userInteractionCost,
                        localUsersCache
                ) }
    }

    override fun getUserInteractionCost(type: UserInteractionType): Mono<BigDecimal> {
        return userInteractionCostCacheWrapper
                .findById(type.name)
                .map { userInteractionCost -> userInteractionCost.cost }
    }

    override fun creatOrUpdateUserInteractionCost(userInteractionCostRequest: UserInteractionCostRequest): Mono<UserInteractionCostFullResponse> {
        return mono {
            val currentUser = reactiveAuthenticationHolder.requireCurrentUserDetails().awaitFirst()

            var cost = userInteractionCostCacheWrapper
                    .findById(userInteractionCostRequest.type.name)
                    .awaitFirstOrNull()

            cost = cost?.copy(
                    cost = userInteractionCostRequest.cost,
                    updatedAt = ZonedDateTime.now(),
                    updatedById = currentUser.id
            )
                    ?: UserInteractionCost(
                            id = ObjectId().toHexString(),
                            type = userInteractionCostRequest.type,
                            cost = userInteractionCostRequest.cost,
                            createdById = currentUser.id,
                            createdAt = ZonedDateTime.now()
                    )

            userInteractionCostRepository.save(cost).awaitFirst()

            return@mono userInteractionCostMapper.toUserInteractionCostFullResponse(cost).awaitFirst()
        }
    }
}