package chatox.user.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.platform.security.reactive.ReactiveAuthenticationHolder
import chatox.user.api.response.UserInteractionResponse
import chatox.user.api.response.UserInteractionsCountResponse
import chatox.user.api.response.UserResponse
import chatox.user.domain.Currency
import chatox.user.domain.User
import chatox.user.domain.UserInteraction
import chatox.user.domain.UserInteractionType
import chatox.user.domain.UserInteractionsCount
import chatox.user.exception.metadata.InsufficientBalanceException
import chatox.user.mapper.UserInteractionMapper
import chatox.user.mapper.UserInteractionsCountMapper
import chatox.user.repository.UserInteractionRepository
import chatox.user.repository.UserInteractionsCountRepository
import chatox.user.service.BalanceService
import chatox.user.service.UserInteractionCostService
import chatox.user.service.UserInteractionService
import chatox.user.service.UserService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.reactor.mono
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime

@Service
class UserInteractionServiceImpl(
        private val userInteractionsCountRepository: UserInteractionsCountRepository,
        private val userInteractionRepository: UserInteractionRepository,
        private val userInteractionCostService: UserInteractionCostService,
        private val userInteractionsCountMapper: UserInteractionsCountMapper,
        private val userInteractionMapper: UserInteractionMapper,
        private val userService: UserService,
        private val balanceService: BalanceService,
        private val authenticationHolder: ReactiveAuthenticationHolder<User>) : UserInteractionService {

    override fun likeUser(userId: String): Mono<UserInteractionsCountResponse> {
        return createUserInteraction(userId, UserInteractionType.LIKE)
    }

    override fun dislikeUser(userId: String): Mono<UserInteractionsCountResponse> {
        return createUserInteraction(userId, UserInteractionType.DISLIKE)
    }

    override fun loveUser(userId: String): Mono<UserInteractionsCountResponse> {
        return createUserInteraction(userId, UserInteractionType.LOVE)
    }

    private fun createUserInteraction(userId: String, type: UserInteractionType): Mono<UserInteractionsCountResponse> {
        return mono {
            userService.assertUserExists(userId).awaitFirstOrNull()

            val currentUser = authenticationHolder.requireCurrentUserDetails().awaitFirst()
            val interactionCost = userInteractionCostService.getUserInteractionCost(type).awaitFirst()
            val currentUserBalance = balanceService.getBalanceOfCurrentUser(Currency.COIN).awaitFirst()

            if (currentUserBalance.amount < interactionCost) {
                throw InsufficientBalanceException(interactionCost, currentUserBalance.amount)
            }

            val userInteraction = UserInteraction(
                    id = ObjectId().toHexString(),
                    userId = currentUser.id,
                    targetUserId = userId,
                    createdAt = ZonedDateTime.now(),
                    type = type,
                    cost = interactionCost
            )
            userInteractionRepository.save(userInteraction).awaitFirst()
            val interactionsCount = incrementInteractionsCount(userId, type).awaitFirst()

            return@mono userInteractionsCountMapper.toUserInteractionsCountResponse(interactionsCount)
        }
    }

    private fun incrementInteractionsCount(userId: String,
                                           interactionType: UserInteractionType): Mono<UserInteractionsCount> {
        return when (interactionType) {
            UserInteractionType.LIKE -> userInteractionsCountRepository.incrementLikesCount(userId)
            UserInteractionType.DISLIKE -> userInteractionsCountRepository.incrementDislikesCount(userId)
            UserInteractionType.LOVE -> userInteractionsCountRepository.incrementLovesCount(userId)
        }
    }

    override fun getUserInteractionsCount(userId: String): Mono<UserInteractionsCountResponse> {
        return mono {
            var userInteractionsCount = userInteractionsCountRepository.findByUserId(userId).awaitFirstOrNull()

            if (userInteractionsCount != null) {
                return@mono userInteractionsCountMapper.toUserInteractionsCountResponse(userInteractionsCount)
            } else {
                userService.assertUserExists(userId).awaitFirstOrNull()

                userInteractionsCount = UserInteractionsCount(
                        id = ObjectId().toHexString(),
                        likesCount = 0,
                        dislikesCount = 0,
                        lovesCount = 0,
                        userId = userId
                )
                userInteractionsCountRepository.save(userInteractionsCount).awaitFirst()

                return@mono userInteractionsCountMapper.toUserInteractionsCountResponse(userInteractionsCount)
            }
        }
    }

    override fun rollbackUserInteraction(userInteractionId: String): Mono<Unit> {
        return mono {
            val userInteraction = userInteractionRepository.findById(userInteractionId).awaitFirstOrNull()
                    ?: return@mono

            when (userInteraction.type) {
                UserInteractionType.LIKE ->
                    userInteractionsCountRepository.decrementLikesCount(userInteraction.targetUserId).awaitFirst()
                UserInteractionType.DISLIKE ->
                    userInteractionsCountRepository.decrementDislikesCount(userInteraction.targetUserId).awaitFirst()
                UserInteractionType.LOVE ->
                    userInteractionsCountRepository.decrementLovesCount(userInteraction.targetUserId).awaitFirst()
            }

            userInteractionRepository.delete(userInteraction).awaitFirstOrNull()
        }
    }

    override fun getUserInteractionsHistory(userId: String, paginationRequest: PaginationRequest): Flux<UserInteractionResponse> {
        val usersCache = mutableMapOf<String, UserResponse>()

        return mono {
            val history = userInteractionRepository
                    .findByTargetUserId(userId, paginationRequest.toPageRequest())
                    .collectList()
                    .awaitFirst()

            return@mono history.map { userInteraction -> userInteractionMapper.toUserInteractionResponse(
                    userInteraction,
                    usersCache
            )
                    .awaitFirst()
            }
        }
                .flatMapIterable { it }
    }
}