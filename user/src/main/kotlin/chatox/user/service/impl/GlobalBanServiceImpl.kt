package chatox.user.service.impl

import chatox.platform.pagination.PaginationRequest
import chatox.user.api.request.BanUserRequest
import chatox.user.api.request.GlobalBanFilters
import chatox.user.api.request.UpdateBanRequest
import chatox.user.api.response.GlobalBanResponse
import chatox.user.cache.UserReactiveRepositoryCacheWrapper
import chatox.user.domain.GlobalBan
import chatox.user.domain.User
import chatox.user.exception.GlobalBanIsNotActiveException
import chatox.user.exception.GlobalBanNotFoundException
import chatox.user.exception.UserNotFoundException
import chatox.user.mapper.GlobalBanMapper
import chatox.user.messaging.rabbitmq.event.producer.GlobalBanEventsProducer
import chatox.user.repository.GlobalBanRepository
import chatox.user.repository.UserRepository
import chatox.user.security.AuthenticationFacade
import chatox.user.service.GlobalBanService
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactor.mono
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.ZonedDateTime
import java.util.UUID

@Service
@Transactional
class GlobalBanServiceImpl(private val globalBanRepository: GlobalBanRepository,
                           private val userRepository: UserRepository,
                           private val globalBanMapper: GlobalBanMapper,
                           private val authenticationFacade: AuthenticationFacade,
                           private val globalBanEventsProducer: GlobalBanEventsProducer,
                           private val userReactiveRepositoryCacheWrapper: UserReactiveRepositoryCacheWrapper) : GlobalBanService {

    override fun banUser(userId: String, banUserRequest: BanUserRequest): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()

            var otherActiveBans = globalBanRepository.findActiveByBannedUser(currentUser)
                    .collectList()
                    .awaitFirst()

            if (otherActiveBans.isNotEmpty()) {
                otherActiveBans = otherActiveBans.map { ban -> ban.copy(
                        canceledAt = ZonedDateTime.now(),
                        cancelledById = currentUser.id,
                        canceled = true
                )}
                globalBanRepository.saveAll(otherActiveBans).collectList().awaitFirst()
            }

            val globalBan = GlobalBan(
                    id = UUID.randomUUID().toString(),
                    createdAt = ZonedDateTime.now(),
                    expiresAt = banUserRequest.expiresAt,
                    bannedUserId = user.id,
                    canceled = false,
                    permanent = banUserRequest.permanent,
                    reason = banUserRequest.reason,
                    createdById = currentUser.id,
                    comment = banUserRequest.comment,
                    canceledAt = null,
                    updatedById = null,
                    updatedAt = null,
                    cancelledById = null
            )
            globalBanRepository.save(globalBan).awaitFirst()

            val globalBanResponse = globalBanMapper.toGlobalBanResponse(
                    globalBan = globalBan,
                    bannedUser = user,
                    createdBy = currentUser,
                    canceledBy = null,
                    updatedBy = null
            )
            globalBanEventsProducer.globalBanCreated(globalBanResponse)

            if (otherActiveBans.isNotEmpty()) {
                otherActiveBans.forEach { ban -> globalBanEventsProducer.globalBanUpdated(globalBanMapper.toGlobalBanResponse(
                        globalBan = ban,
                        updatedBy = currentUser,
                        bannedUser = user,
                        canceledBy = currentUser,
                        createdBy = userReactiveRepositoryCacheWrapper.findById(ban.createdById).awaitFirst()
                )) }
            }

            globalBanResponse
        }
    }

    override fun updateBan(userId: String, banId: String, updateBanRequest: UpdateBanRequest): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()
            var ban = findBanByUserAndBanId(user, banId).awaitFirst()

            if (!isBanActive(ban)) {
                throw GlobalBanIsNotActiveException("Cannot update global ban if it's expired or canceled")
            }

            ban = ban.copy(
                    expiresAt = updateBanRequest.expiresAt,
                    permanent = updateBanRequest.permanent,
                    reason = updateBanRequest.reason,
                    comment = updateBanRequest.comment,
                    updatedAt = ZonedDateTime.now(),
                    updatedById = currentUser.id
            )
            globalBanRepository.save(ban)

            val globalBanResponse = globalBanMapper.toGlobalBanResponse(
                    globalBan = ban,
                    createdBy = userReactiveRepositoryCacheWrapper.findById(ban.createdById).awaitFirst(),
                    canceledBy = if (ban.cancelledById != null) userReactiveRepositoryCacheWrapper.findById(ban.cancelledById!!).awaitFirst() else null,
                    bannedUser = userReactiveRepositoryCacheWrapper.findById(ban.bannedUserId).awaitFirst(),
                    updatedBy = currentUser
            )
            globalBanEventsProducer.globalBanUpdated(globalBanResponse)
            globalBanResponse
        }
    }

    override fun cancelBan(userId: String, banId: String): Mono<GlobalBanResponse> {
        return mono {
            val user = findUserById(userId).awaitFirst()
            val currentUser = authenticationFacade.getCurrentUserEntity().awaitFirst()
            var ban = findBanByUserAndBanId(user, banId).awaitFirst()

            if (!isBanActive(ban)) {
                throw GlobalBanIsNotActiveException("Cannot cancel ban which is not active")
            }

            ban = ban.copy(
                    canceled = true,
                    canceledAt = ZonedDateTime.now(),
                    cancelledById = currentUser.id
            )
            globalBanRepository.save(ban).awaitFirst()

            val globalBanResponse = globalBanMapper.toGlobalBanResponse(
                    globalBan = ban,
                    bannedUser = userReactiveRepositoryCacheWrapper.findById(ban.bannedUserId).awaitFirst(),
                    updatedBy = if (ban.updatedById != null) userReactiveRepositoryCacheWrapper.findById(ban.updatedById!!).awaitFirst() else null,
                    canceledBy = currentUser,
                    createdBy = userReactiveRepositoryCacheWrapper.findById(ban.createdById).awaitFirst()
            )
            globalBanEventsProducer.globalBanUpdated(globalBanResponse)
            globalBanResponse
        }
    }

    override fun findBans(filters: GlobalBanFilters, paginationRequest: PaginationRequest): Flux<GlobalBanResponse> {
       return mono {
           val globalBans = globalBanRepository.searchGlobalBans(filters, paginationRequest.toPageRequest())
                   .collectList()
                   .awaitFirst()

           globalBans.map { globalBan -> globalBanMapper.toGlobalBanResponse(
                   globalBan = globalBan,
                   bannedUser = userReactiveRepositoryCacheWrapper.findById(globalBan.bannedUserId).awaitFirst(),
                   createdBy = userReactiveRepositoryCacheWrapper.findById(globalBan.createdById).awaitFirst(),
                   canceledBy = if (globalBan.cancelledById != null) userReactiveRepositoryCacheWrapper.findById(globalBan.cancelledById!!).awaitFirst() else null,
                   updatedBy = if (globalBan.updatedById != null) userReactiveRepositoryCacheWrapper.findById(globalBan.updatedById!!).awaitFirst() else null
           ) }
       }
               .flatMapIterable { it }
    }

    private fun findUserById(userId: String) = userRepository.findById(userId)
            .switchIfEmpty(Mono.error(UserNotFoundException("Could not find user with id $userId")))

    private fun isBanActive(ban: GlobalBan): Boolean {
        return !ban.canceled && (ban.permanent || (ban.expiresAt != null && ban.expiresAt!!.isAfter(ZonedDateTime.now())))
    }

    private fun findBanByUserAndBanId(user: User, banId: String) = globalBanRepository.findByBannedUserIdAndId(
            userId = user.id,
            id = banId
    )
            .switchIfEmpty(Mono.error(GlobalBanNotFoundException("Could not find global ban of user ${user.id} with id $banId")))
}
